import pytest

EMPLOYEE_PAYLOAD = {
    "full_name": "Test User",
    "email": "test@example.com",
    "job_title": "Software Engineer I",
    "department": "Engineering",
    "country": "India",
    "salary": 75000,
    "currency": "USD",
    "employment_type": "FULL_TIME",
    "status": "ACTIVE",
    "hire_date": "2022-06-01",
}


@pytest.fixture
async def seeded_client(client):
    await client.post("/api/v1/employees", json=EMPLOYEE_PAYLOAD)
    await client.post("/api/v1/employees", json={**EMPLOYEE_PAYLOAD, "email": "test2@example.com", "salary": 95000})
    return client


async def test_insights_overview_contains_expected_keys(seeded_client):
    response = await seeded_client.get("/api/v1/insights/overview")
    assert response.status_code == 200
    body = response.json()["data"]
    for key in ("total_employees", "active_count", "total_payroll", "avg_salary", "countries_count"):
        assert key in body


async def test_country_insights_returns_correct_stats(seeded_client):
    response = await seeded_client.get("/api/v1/insights/country/India")
    assert response.status_code == 200
    body = response.json()["data"]
    assert body["headcount"] == 2
    assert body["min_salary"] == 75000


async def test_job_title_insights_scoped_to_country(seeded_client):
    response = await seeded_client.get(
        "/api/v1/insights/job-title", params={"country": "India", "job_title": "Software Engineer I"}
    )
    assert response.status_code == 200
    body = response.json()["data"]
    assert body["headcount"] == 2


async def test_distribution_returns_5_buckets(seeded_client):
    response = await seeded_client.get("/api/v1/insights/distribution")
    assert response.status_code == 200
    buckets = response.json()["data"]
    assert len(buckets) == 5
