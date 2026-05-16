from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee


class EmployeeRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: dict) -> Employee:
        employee = Employee(**data)
        self.session.add(employee)
        await self.session.commit()
        await self.session.refresh(employee)
        return employee

    async def get_by_id(self, employee_id: str) -> Employee | None:
        result = await self.session.execute(select(Employee).where(Employee.id == employee_id))
        return result.scalar_one_or_none()

    async def list(self, skip: int, limit: int, filters: dict) -> tuple[list[Employee], int]:
        query = select(Employee)
        query = self._apply_filters(query, filters)

        count_result = await self.session.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar_one()

        result = await self.session.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all()), total

    async def update(self, employee_id: str, data: dict) -> Employee | None:
        employee = await self.get_by_id(employee_id)
        if employee is None:
            return None
        for key, value in data.items():
            setattr(employee, key, value)
        await self.session.commit()
        await self.session.refresh(employee)
        return employee

    async def delete(self, employee_id: str) -> bool:
        employee = await self.get_by_id(employee_id)
        if employee is None:
            return False
        await self.session.delete(employee)
        await self.session.commit()
        return True

    async def search(self, query: str, skip: int, limit: int) -> tuple[list[Employee], int]:
        pattern = f"%{query}%"
        base_query = select(Employee).where(
            Employee.full_name.ilike(pattern)
            | Employee.email.ilike(pattern)
            | Employee.job_title.ilike(pattern)
        )

        count_result = await self.session.execute(
            select(func.count()).select_from(base_query.subquery())
        )
        total = count_result.scalar_one()

        result = await self.session.execute(base_query.offset(skip).limit(limit))
        return list(result.scalars().all()), total

    def _apply_filters(self, query, filters: dict):
        if filters.get("country"):
            query = query.where(Employee.country == filters["country"])
        if filters.get("department"):
            query = query.where(Employee.department == filters["department"])
        if filters.get("job_title"):
            query = query.where(Employee.job_title == filters["job_title"])
        if filters.get("status"):
            query = query.where(Employee.status == filters["status"])
        if filters.get("employment_type"):
            query = query.where(Employee.employment_type == filters["employment_type"])
        return query
