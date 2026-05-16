from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, EmailStr, field_validator

from app.models.enums import EmployeeStatus, EmploymentType


class EmployeeCreate(BaseModel):
    full_name: str
    email: EmailStr
    job_title: str
    department: str
    country: str
    salary: Decimal
    currency: str = "USD"
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    status: EmployeeStatus = EmployeeStatus.ACTIVE
    hire_date: date

    @field_validator("salary")
    @classmethod
    def salary_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("salary must be positive")
        return v


class EmployeeUpdate(EmployeeCreate):
    pass


class EmployeePatch(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    job_title: str | None = None
    department: str | None = None
    country: str | None = None
    salary: Decimal | None = None
    currency: str | None = None
    employment_type: EmploymentType | None = None
    status: EmployeeStatus | None = None
    hire_date: date | None = None

    @field_validator("salary")
    @classmethod
    def salary_must_be_positive(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v <= 0:
            raise ValueError("salary must be positive")
        return v


class EmployeeResponse(BaseModel):
    id: str
    full_name: str
    email: str
    job_title: str
    department: str
    country: str
    salary: Decimal
    currency: str
    employment_type: EmploymentType
    status: EmployeeStatus
    hire_date: date
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class PaginationMeta(BaseModel):
    total: int
    page: int
    per_page: int
    total_pages: int


class EmployeeListResponse(BaseModel):
    data: list[EmployeeResponse]
    meta: PaginationMeta
    message: str = "success"


class SingleEmployeeResponse(BaseModel):
    data: EmployeeResponse
    message: str = "success"


def paginate(items: list[Any], total: int, page: int, per_page: int) -> dict:
    return {
        "data": items,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": max(1, -(-total // per_page)),
        },
        "message": "success",
    }
