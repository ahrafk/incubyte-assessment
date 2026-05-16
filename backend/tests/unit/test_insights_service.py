from datetime import date

import pytest

from app.repositories.employee_repository import EmployeeRepository
from app.services.insights_service import InsightsService


def make_employee(email: str, country: str, job_title: str, salary: float, department: str = "Engineering"):
    return {
        "full_name": "Test User",
        "email": email,
        "job_title": job_title,
        "department": department,
        "country": country,
        "salary": salary,
        "hire_date": date(2022, 1, 1),
    }


@pytest.fixture
async def seeded_session(db_session):
    repo = EmployeeRepository(db_session)
    employees = [
        make_employee("a@x.com", "India", "Software Engineer I", 60000),
        make_employee("b@x.com", "India", "Software Engineer I", 80000),
        make_employee("c@x.com", "India", "Staff Engineer", 150000),
        make_employee("d@x.com", "United States", "Software Engineer I", 120000),
        make_employee("e@x.com", "United States", "Director", 220000),
    ]
    for emp in employees:
        await repo.create(emp)
    return db_session


async def test_country_stats_returns_min_max_avg_salary(seeded_session):
    service = InsightsService(seeded_session)
    stats = await service.get_country_stats("India")
    assert stats["min_salary"] == 60000
    assert stats["max_salary"] == 150000
    assert stats["headcount"] == 3


async def test_country_stats_for_unknown_country_returns_empty(seeded_session):
    service = InsightsService(seeded_session)
    stats = await service.get_country_stats("Narnia")
    assert stats["headcount"] == 0


async def test_job_title_stats_scoped_to_country(seeded_session):
    service = InsightsService(seeded_session)
    stats = await service.get_job_title_stats("India", "Software Engineer I")
    assert stats["headcount"] == 2
    assert stats["min_salary"] == 60000
    assert stats["max_salary"] == 80000


async def test_salary_distribution_returns_correct_buckets(seeded_session):
    service = InsightsService(seeded_session)
    buckets = await service.get_salary_distribution()
    assert len(buckets) == 5
    labels = [b["label"] for b in buckets]
    assert "<30k" in labels
    assert "150k+" in labels


async def test_overview_returns_total_headcount_and_payroll(seeded_session):
    service = InsightsService(seeded_session)
    overview = await service.get_overview()
    assert overview["total_employees"] == 5
    assert overview["total_payroll"] == 630000
    assert overview["countries_count"] == 2
