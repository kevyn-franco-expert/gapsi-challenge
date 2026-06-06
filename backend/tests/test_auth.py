"""Authentication endpoint tests covering login, token generation, and profile access."""
import pytest


def test_login_success(client):
    """Valid credentials should return a JWT access token."""
    response = client.post(
        "/auth/login",
        data={"username": "admin", "password": "admin123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client):
    """Invalid password should return HTTP 401 Unauthorized."""
    response = client.post(
        "/auth/login",
        data={"username": "admin", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_me_endpoint_requires_auth(client):
    """Accessing /auth/me without a token should return 401."""
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_me_endpoint_with_valid_token(client, auth_token):
    """Accessing /auth/me with a valid token should return user profile."""
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "admin"
    assert data["role"] == "admin"
