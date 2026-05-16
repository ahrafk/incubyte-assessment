from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.services.insights_service import InsightsService

router = APIRouter(prefix="/api/v1/insights", tags=["insights"])


def _wrap(data) -> dict:
    return {"data": data, "message": "success"}


@router.get("/overview")
async def get_overview(session: AsyncSession = Depends(get_session)):
    return _wrap(await InsightsService(session).get_overview())


@router.get("/country/{country}")
async def get_country_stats(country: str, session: AsyncSession = Depends(get_session)):
    return _wrap(await InsightsService(session).get_country_stats(country))


@router.get("/job-title")
async def get_job_title_stats(
    country: str = Query(...),
    job_title: str = Query(...),
    session: AsyncSession = Depends(get_session),
):
    return _wrap(await InsightsService(session).get_job_title_stats(country, job_title))


@router.get("/distribution")
async def get_salary_distribution(session: AsyncSession = Depends(get_session)):
    return _wrap(await InsightsService(session).get_salary_distribution())


@router.get("/departments")
async def get_department_breakdown(session: AsyncSession = Depends(get_session)):
    return _wrap(await InsightsService(session).get_department_breakdown())


@router.get("/top-earners")
async def get_top_earners(
    limit: int = Query(10, ge=1, le=50),
    session: AsyncSession = Depends(get_session),
):
    return _wrap(await InsightsService(session).get_top_earners(limit))


@router.get("/headcount-trend")
async def get_headcount_trend(session: AsyncSession = Depends(get_session)):
    return _wrap(await InsightsService(session).get_headcount_trend())
