from datetime import date

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.employee import Employee
from app.repositories.employee_repository import EmployeeRepository


def make_employee_data(**overrides):
    base = {
        "full_name": "Jane Doe",
        "email": "jane.doe@example.com",
        "job_title": "Software Engineer II",
        "department": "Engineering",
        "country": "United States",
        "salary": 95000,
        "hire_date": date(2023, 1, 15),
    }
    return {**base, **overrides}


async def test_employee_can_be_created_and_retrieved(db_session):
    employee = Employee(**make_employee_data())
    db_session.add(employee)
    await db_session.commit()
    await db_session.refresh(employee)

    assert employee.id is not None
    assert employee.full_name == "Jane Doe"
    assert employee.email == "jane.doe@example.com"
    assert employee.status.value == "ACTIVE"


async def test_duplicate_email_raises_integrity_error(db_session):
    for _ in range(2):
        db_session.add(Employee(**make_employee_data(email="duplicate@example.com")))
    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_salary_cannot_be_negative(db_session):
    db_session.add(Employee(**make_employee_data(email="bad@example.com", salary=-1000)))
    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_create_employee_persists_to_db(db_session):
    repo = EmployeeRepository(db_session)
    employee = await repo.create(make_employee_data())
    assert employee.id is not None
    assert employee.full_name == "Jane Doe"


async def test_get_by_id_returns_correct_employee(db_session):
    repo = EmployeeRepository(db_session)
    created = await repo.create(make_employee_data())
    fetched = await repo.get_by_id(created.id)
    assert fetched is not None
    assert fetched.id == created.id


async def test_get_by_id_with_unknown_id_returns_none(db_session):
    repo = EmployeeRepository(db_session)
    result = await repo.get_by_id("00000000-0000-0000-0000-000000000000")
    assert result is None


async def test_list_employees_returns_paginated_results(db_session):
    repo = EmployeeRepository(db_session)
    for i in range(5):
        await repo.create(make_employee_data(email=f"user{i}@example.com", full_name=f"User {i}"))

    employees, total = await repo.list(skip=0, limit=3, filters={})
    assert len(employees) == 3
    assert total == 5


async def test_update_employee_changes_fields(db_session):
    repo = EmployeeRepository(db_session)
    created = await repo.create(make_employee_data())
    updated = await repo.update(created.id, {"full_name": "Jane Updated", "salary": 110000})
    assert updated.full_name == "Jane Updated"
    assert updated.salary == 110000


async def test_delete_employee_removes_record(db_session):
    repo = EmployeeRepository(db_session)
    created = await repo.create(make_employee_data())
    deleted = await repo.delete(created.id)
    assert deleted is True
    assert await repo.get_by_id(created.id) is None


async def test_search_by_name_returns_matching_employees(db_session):
    repo = EmployeeRepository(db_session)
    await repo.create(make_employee_data(email="alice@example.com", full_name="Alice Smith"))
    await repo.create(make_employee_data(email="bob@example.com", full_name="Bob Johnson"))

    results, total = await repo.search("Alice", skip=0, limit=10)
    assert total == 1
    assert results[0].full_name == "Alice Smith"
