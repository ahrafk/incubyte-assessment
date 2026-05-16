from datetime import date

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.employee import Employee


async def test_employee_can_be_created_and_retrieved(db_session):
    employee = Employee(
        full_name="Jane Doe",
        email="jane.doe@example.com",
        job_title="Software Engineer II",
        department="Engineering",
        country="United States",
        salary=95000,
        hire_date=date(2023, 1, 15),
    )
    db_session.add(employee)
    await db_session.commit()
    await db_session.refresh(employee)

    assert employee.id is not None
    assert employee.full_name == "Jane Doe"
    assert employee.email == "jane.doe@example.com"
    assert employee.status.value == "ACTIVE"


async def test_duplicate_email_raises_integrity_error(db_session):
    for _ in range(2):
        db_session.add(
            Employee(
                full_name="John Smith",
                email="duplicate@example.com",
                job_title="QA Engineer",
                department="Engineering",
                country="India",
                salary=70000,
                hire_date=date(2022, 6, 1),
            )
        )
    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_salary_cannot_be_negative(db_session):
    db_session.add(
        Employee(
            full_name="Bad Salary",
            email="bad@example.com",
            job_title="Intern",
            department="HR",
            country="Germany",
            salary=-1000,
            hire_date=date(2024, 1, 1),
        )
    )
    with pytest.raises(IntegrityError):
        await db_session.commit()
