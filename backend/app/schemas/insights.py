from __future__ import annotations

from pydantic import BaseModel


class CountryStats(BaseModel):
    country: str | None = None
    headcount: int
    min_salary: float | None = None
    max_salary: float | None = None
    avg_salary: float | None = None
    median_salary: float | None = None
    total_payroll: float | None = None


class JobTitleStats(BaseModel):
    country: str | None = None
    job_title: str | None = None
    headcount: int
    min_salary: float | None = None
    max_salary: float | None = None
    avg_salary: float | None = None


class SalaryBucket(BaseModel):
    label: str
    count: int


class OverviewStats(BaseModel):
    total_employees: int
    active_count: int
    total_payroll: float
    avg_salary: float
    countries_count: int
    departments_count: int


class DepartmentStat(BaseModel):
    department: str
    avg_salary: float
    headcount: int


class TopEarner(BaseModel):
    id: str
    full_name: str
    job_title: str
    department: str
    country: str
    salary: float
    currency: str


class HeadcountPoint(BaseModel):
    month: str
    count: int
