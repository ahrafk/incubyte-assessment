from datetime import date

import pytest

from app.core.exceptions import ConflictError, NotFoundError
from app.services.employee_service import EmployeeService


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


async def test_create_employee_with_valid_data_succeeds(db_session):
    service = EmployeeService(db_session)
    employee = await service.create(make_employee_data())
    assert employee.id is not None
    assert employee.email == "jane.doe@example.com"


async def test_create_employee_with_duplicate_email_raises_409(db_session):
    service = EmployeeService(db_session)
    await service.create(make_employee_data())
    with pytest.raises(ConflictError):
        await service.create(make_employee_data())


async def test_update_nonexistent_employee_raises_404(db_session):
    service = EmployeeService(db_session)
    with pytest.raises(NotFoundError):
        await service.update("nonexistent-id", {"full_name": "New Name"})


async def test_delete_nonexistent_employee_raises_404(db_session):
    service = EmployeeService(db_session)
    with pytest.raises(NotFoundError):
        await service.delete("nonexistent-id")


async def test_salary_must_be_positive(db_session):
    service = EmployeeService(db_session)
    with pytest.raises(ValueError, match="salary"):
        await service.create(make_employee_data(salary=-500))
