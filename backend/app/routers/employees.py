from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import insights_cache
from app.database import get_session
from app.schemas.employee import (
    EmployeeCreate,
    EmployeePatch,
    EmployeeResponse,
    EmployeeUpdate,
    SingleEmployeeResponse,
    paginate,
)
from app.services.employee_service import EmployeeService

router = APIRouter(prefix="/api/v1/employees", tags=["employees"])


@router.get("")
async def list_employees(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    search: str | None = Query(None),
    country: str | None = Query(None),
    department: str | None = Query(None),
    job_title: str | None = Query(None),
    status: str | None = Query(None),
    employment_type: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    filters = {k: v for k, v in {
        "country": country,
        "department": department,
        "job_title": job_title,
        "status": status,
        "employment_type": employment_type,
    }.items() if v is not None}

    skip = (page - 1) * per_page
    service = EmployeeService(session)
    employees, total = await service.list(skip=skip, limit=per_page, filters=filters, search=search)
    return paginate([EmployeeResponse.model_validate(e) for e in employees], total, page, per_page)


@router.post("", status_code=201)
async def create_employee(
    payload: EmployeeCreate,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    service = EmployeeService(session)
    employee = await service.create(payload.model_dump())
    insights_cache.invalidate()
    response.headers["Location"] = f"/api/v1/employees/{employee.id}"
    return {"data": EmployeeResponse.model_validate(employee), "message": "success"}


@router.get("/{employee_id}")
async def get_employee(employee_id: str, session: AsyncSession = Depends(get_session)):
    service = EmployeeService(session)
    employee = await service.get(employee_id)
    return {"data": EmployeeResponse.model_validate(employee), "message": "success"}


@router.put("/{employee_id}")
async def replace_employee(
    employee_id: str,
    payload: EmployeeUpdate,
    session: AsyncSession = Depends(get_session),
):
    service = EmployeeService(session)
    employee = await service.update(employee_id, payload.model_dump())
    insights_cache.invalidate()
    return {"data": EmployeeResponse.model_validate(employee), "message": "success"}


@router.patch("/{employee_id}")
async def update_employee(
    employee_id: str,
    payload: EmployeePatch,
    session: AsyncSession = Depends(get_session),
):
    service = EmployeeService(session)
    data = payload.model_dump(exclude_unset=True)
    employee = await service.update(employee_id, data)
    insights_cache.invalidate()
    return {"data": EmployeeResponse.model_validate(employee), "message": "success"}


@router.delete("/{employee_id}", status_code=204)
async def delete_employee(employee_id: str, session: AsyncSession = Depends(get_session)):
    service = EmployeeService(session)
    await service.delete(employee_id)
    insights_cache.invalidate()
