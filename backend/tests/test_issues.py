"""Issues endpoint tests covering CRUD, filtering, pagination, and RBAC."""
import pytest


@pytest.fixture(scope="function")
def created_issue(client, auth_token):
    """Create a sample issue and yield its ID for dependent tests."""
    response = client.post(
        "/issues",
        json={"title": "Test Issue", "description": "Test desc", "priority": "alta"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_create_issue(client, auth_token):
    """Creating an issue with valid data should return 201 and the issue body."""
    response = client.post(
        "/issues",
        json={"title": "Create Test", "description": "Desc", "priority": "media"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Create Test"
    assert data["status"] == "abierto"


def test_list_issues_requires_auth(client):
    """Listing issues without authentication should return 401."""
    response = client.get("/issues")
    assert response.status_code == 401


def test_list_issues_paginated(client, auth_token):
    """Listing issues with limit and offset should return paginated results."""
    response = client.get(
        "/issues?limit=5&offset=0",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5


def test_get_issue_by_id(client, auth_token, created_issue):
    """Retrieving an issue by its ID should return the full record."""
    response = client.get(
        f"/issues/{created_issue}",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == created_issue


def test_update_issue(client, auth_token, created_issue):
    """Patching an issue should update only the provided fields."""
    response = client.patch(
        f"/issues/{created_issue}",
        json={"status": "en progreso"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "en progreso"


def test_delete_issue_requires_admin(client, auth_token):
    """Non-admin users should receive 403 when attempting to delete."""
    # Create with admin token first
    create_resp = client.post(
        "/issues",
        json={"title": "Delete Test", "description": "Desc", "priority": "baja"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    issue_id = create_resp.json()["id"]

    # Login as regular user
    user_login = client.post(
        "/auth/login",
        data={"username": "user", "password": "user123"},
    )
    user_token = user_login.json()["access_token"]

    # Attempt delete as user
    response = client.delete(
        f"/issues/{issue_id}",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert response.status_code == 403


def test_summary_endpoint(client, auth_token):
    """The summary endpoint should return aggregate counts by status."""
    response = client.get(
        "/issues/summary",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "by_status" in data
    assert "abierto" in data["by_status"]
