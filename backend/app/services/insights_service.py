from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import insights_cache
from app.models.employee import Employee
from app.models.enums import EmployeeStatus


class InsightsService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_country_stats(self, country: str) -> dict:
        cache_key = f"country_stats:{country}"
        cached = insights_cache.get(cache_key)
        if cached is not None:
            return cached
        result = await self.session.execute(
            select(
                func.min(Employee.salary).label("min_salary"),
                func.max(Employee.salary).label("max_salary"),
                func.avg(Employee.salary).label("avg_salary"),
                func.sum(Employee.salary).label("total_payroll"),
                func.count(Employee.id).label("headcount"),
            ).where(Employee.country == country)
        )
        row = result.one()

        if row.headcount == 0:
            return {"headcount": 0, "min_salary": None, "max_salary": None, "avg_salary": None, "total_payroll": None}

        median = await self._get_median_salary(country=country)
        stats = {
            "country": country,
            "headcount": row.headcount,
            "min_salary": float(row.min_salary),
            "max_salary": float(row.max_salary),
            "avg_salary": round(float(row.avg_salary), 2),
            "median_salary": median,
            "total_payroll": float(row.total_payroll),
        }
        insights_cache.set(cache_key, stats)
        return stats

    async def get_job_title_stats(self, country: str, job_title: str) -> dict:
        result = await self.session.execute(
            select(
                func.min(Employee.salary).label("min_salary"),
                func.max(Employee.salary).label("max_salary"),
                func.avg(Employee.salary).label("avg_salary"),
                func.count(Employee.id).label("headcount"),
            ).where(Employee.country == country, Employee.job_title == job_title)
        )
        row = result.one()
        if row.headcount == 0:
            return {"headcount": 0}
        return {
            "country": country,
            "job_title": job_title,
            "headcount": row.headcount,
            "min_salary": float(row.min_salary),
            "max_salary": float(row.max_salary),
            "avg_salary": round(float(row.avg_salary), 2),
        }

    async def get_salary_distribution(self) -> list[dict]:
        buckets = [
            ("<30k", 0, 30_000),
            ("30-60k", 30_000, 60_000),
            ("60-100k", 60_000, 100_000),
            ("100-150k", 100_000, 150_000),
            ("150k+", 150_000, None),
        ]

        result = await self.session.execute(
            select(
                func.count(
                    case(
                        (Employee.salary < 30_000, 1),
                    )
                ).label("lt30k"),
                func.count(
                    case(
                        ((Employee.salary >= 30_000) & (Employee.salary < 60_000), 1),
                    )
                ).label("r30_60k"),
                func.count(
                    case(
                        ((Employee.salary >= 60_000) & (Employee.salary < 100_000), 1),
                    )
                ).label("r60_100k"),
                func.count(
                    case(
                        ((Employee.salary >= 100_000) & (Employee.salary < 150_000), 1),
                    )
                ).label("r100_150k"),
                func.count(
                    case(
                        (Employee.salary >= 150_000, 1),
                    )
                ).label("gte150k"),
            )
        )
        row = result.one()
        counts = [row.lt30k, row.r30_60k, row.r60_100k, row.r100_150k, row.gte150k]
        return [{"label": label, "count": count} for (label, *_), count in zip(buckets, counts)]

    async def get_overview(self) -> dict:
        cached = insights_cache.get("overview")
        if cached is not None:
            return cached
        result = await self.session.execute(
            select(
                func.count(Employee.id).label("total_employees"),
                func.count(case((Employee.status == EmployeeStatus.ACTIVE, 1))).label("active_count"),
                func.sum(Employee.salary).label("total_payroll"),
                func.avg(Employee.salary).label("avg_salary"),
                func.count(func.distinct(Employee.country)).label("countries_count"),
                func.count(func.distinct(Employee.department)).label("departments_count"),
            )
        )
        row = result.one()
        overview = {
            "total_employees": row.total_employees,
            "active_count": row.active_count,
            "total_payroll": float(row.total_payroll or 0),
            "avg_salary": round(float(row.avg_salary or 0), 2),
            "countries_count": row.countries_count,
            "departments_count": row.departments_count,
        }
        insights_cache.set("overview", overview)
        return overview

    async def get_department_breakdown(self) -> list[dict]:
        result = await self.session.execute(
            select(
                Employee.department,
                func.avg(Employee.salary).label("avg_salary"),
                func.count(Employee.id).label("headcount"),
            )
            .group_by(Employee.department)
            .order_by(func.avg(Employee.salary).desc())
        )
        return [
            {"department": row.department, "avg_salary": round(float(row.avg_salary), 2), "headcount": row.headcount}
            for row in result.all()
        ]

    async def get_top_earners(self, limit: int = 10) -> list[dict]:
        result = await self.session.execute(
            select(Employee).order_by(Employee.salary.desc()).limit(limit)
        )
        return [
            {
                "id": e.id,
                "full_name": e.full_name,
                "job_title": e.job_title,
                "department": e.department,
                "country": e.country,
                "salary": float(e.salary),
                "currency": e.currency,
            }
            for e in result.scalars().all()
        ]

    async def get_headcount_trend(self) -> list[dict]:
        today = date.today()
        twelve_months_ago = today - timedelta(days=365)

        result = await self.session.execute(
            select(
                func.strftime("%Y-%m", Employee.hire_date).label("month"),
                func.count(Employee.id).label("count"),
            )
            .where(Employee.hire_date >= twelve_months_ago)
            .group_by(func.strftime("%Y-%m", Employee.hire_date))
            .order_by(func.strftime("%Y-%m", Employee.hire_date))
        )
        return [{"month": row.month, "count": row.count} for row in result.all()]

    async def _get_median_salary(self, country: str | None = None) -> float | None:
        query = select(Employee.salary)
        if country:
            query = query.where(Employee.country == country)
        query = query.order_by(Employee.salary)

        result = await self.session.execute(query)
        salaries = [float(r) for r in result.scalars().all()]
        if not salaries:
            return None
        mid = len(salaries) // 2
        if len(salaries) % 2 == 0:
            return (salaries[mid - 1] + salaries[mid]) / 2
        return salaries[mid]
