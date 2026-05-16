from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.employee import Employee
from app.repositories.employee_repository import EmployeeRepository


class EmployeeService:
    def __init__(self, session: AsyncSession):
        self.repo = EmployeeRepository(session)
        self.session = session

    async def create(self, data: dict) -> Employee:
        if data.get("salary") is not None and float(data["salary"]) <= 0:
            raise ValueError("salary must be positive")

        existing = await self.session.execute(
            select(Employee).where(Employee.email == data["email"])
        )
        if existing.scalar_one_or_none() is not None:
            raise ConflictError(f"An employee with email {data['email']} already exists")

        return await self.repo.create(data)

    async def get(self, employee_id: str) -> Employee:
        employee = await self.repo.get_by_id(employee_id)
        if employee is None:
            raise NotFoundError("Employee", employee_id)
        return employee

    async def list(
        self, skip: int, limit: int, filters: dict, search: str | None = None
    ) -> tuple[list[Employee], int]:
        if search:
            return await self.repo.search(search, skip, limit, filters)
        return await self.repo.list(skip, limit, filters)

    async def update(self, employee_id: str, data: dict) -> Employee:
        if data.get("salary") is not None and float(data["salary"]) <= 0:
            raise ValueError("salary must be positive")

        employee = await self.repo.update(employee_id, data)
        if employee is None:
            raise NotFoundError("Employee", employee_id)
        return employee

    async def delete(self, employee_id: str) -> None:
        deleted = await self.repo.delete(employee_id)
        if not deleted:
            raise NotFoundError("Employee", employee_id)
