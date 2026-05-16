import pytest


async def test_health_check_returns_200(client):
    response = await client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "version" in body


VALID_PAYLOAD = {
    "full_name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "job_title": "Software Engineer II",
    "department": "Engineering",
    "country": "United States",
    "salary": 110000,
    "currency": "USD",
    "employment_type": "FULL_TIME",
    "status": "ACTIVE",
    "hire_date": "2022-03-15",
}


async def test_create_employee_returns_201_with_location_header(client):
    response = await client.post("/api/v1/employees", json=VALID_PAYLOAD)
    assert response.status_code == 201
    assert "location" in response.headers
    body = response.json()
    assert body["data"]["email"] == VALID_PAYLOAD["email"]


async def test_list_employees_returns_paginated_envelope(client):
    await client.post("/api/v1/employees", json=VALID_PAYLOAD)
    response = await client.get("/api/v1/employees")
    assert response.status_code == 200
    body = response.json()
    assert "data" in body
    assert "meta" in body
    assert body["meta"]["total"] >= 1


async def test_get_employee_by_id_returns_correct_data(client):
    create_resp = await client.post("/api/v1/employees", json=VALID_PAYLOAD)
    employee_id = create_resp.json()["data"]["id"]

    response = await client.get(f"/api/v1/employees/{employee_id}")
    assert response.status_code == 200
    assert response.json()["data"]["id"] == employee_id


async def test_update_employee_returns_updated_fields(client):
    create_resp = await client.post("/api/v1/employees", json=VALID_PAYLOAD)
    employee_id = create_resp.json()["data"]["id"]

    response = await client.patch(f"/api/v1/employees/{employee_id}", json={"full_name": "Alice Updated"})
    assert response.status_code == 200
    assert response.json()["data"]["full_name"] == "Alice Updated"


async def test_delete_employee_returns_204(client):
    create_resp = await client.post("/api/v1/employees", json=VALID_PAYLOAD)
    employee_id = create_resp.json()["data"]["id"]

    response = await client.delete(f"/api/v1/employees/{employee_id}")
    assert response.status_code == 204


async def test_create_employee_with_missing_fields_returns_422(client):
    response = await client.post("/api/v1/employees", json={"email": "incomplete@example.com"})
    assert response.status_code == 422


async def test_create_duplicate_email_returns_409(client):
    await client.post("/api/v1/employees", json=VALID_PAYLOAD)
    response = await client.post("/api/v1/employees", json=VALID_PAYLOAD)
    assert response.status_code == 409
