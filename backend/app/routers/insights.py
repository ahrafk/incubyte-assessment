from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.services.insights_service import InsightsService

router = APIRouter(prefix="/api/v1/insights", tags=["insights"])


@router.get("/overview")
async def get_overview(session: AsyncSession = Depends(get_session)):
    service = InsightsService(session)
    return {"data": await service.get_overview(), "message": "success"}


@router.get("/country/{country}")
async def get_country_stats(country: str, session: AsyncSession = Depends(get_session)):
    service = InsightsService(session)
    return {"data": await service.get_country_stats(country), "message": "success"}


@router.get("/job-title")
async def get_job_title_stats(
    country: str = Query(...),
    job_title: str = Query(...),
    session: AsyncSession = Depends(get_session),
):
    service = InsightsService(session)
    return {"data": await service.get_job_title_stats(country, job_title), "message": "success"}


@router.get("/distribution")
async def get_salary_distribution(session: AsyncSession = Depends(get_session)):
    service = InsightsService(session)
    return {"data": await service.get_salary_distribution(), "message": "success"}


@router.get("/departments")
async def get_department_breakdown(session: AsyncSession = Depends(get_session)):
    service = InsightsService(session)
    return {"data": await service.get_department_breakdown(), "message": "success"}


@router.get("/top-earners")
async def get_top_earners(
    limit: int = Query(10, ge=1, le=50),
    session: AsyncSession = Depends(get_session),
):
    service = InsightsService(session)
    return {"data": await service.get_top_earners(limit), "message": "success"}


@router.get("/headcount-trend")
async def get_headcount_trend(session: AsyncSession = Depends(get_session)):
    service = InsightsService(session)
    return {"data": await service.get_headcount_trend(), "message": "success"}
