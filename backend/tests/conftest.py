"""Pytest configuration and shared fixtures for the Issue Tracker test suite."""
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    """Provide a reusable TestClient for the FastAPI application."""
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="function")
def auth_token(client):
    """Obtain a valid JWT access token for the admin test user."""
    response = client.post(
        "/auth/login",
        data={"username": "admin", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]
