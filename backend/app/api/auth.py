"""Authentication router providing OAuth2 login and current user resolution."""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.security import verify_password, create_access_token, decode_token
from app.models.schemas import Token, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Pre-seeded users (hashed passwords via bcrypt)
USERS_DB = {
    "admin": {
        "username": "admin",
        "full_name": "Administrador",
        "hashed_password": "$2b$12$32a.g7a4x6kaGwfONCsGXemnteH6ZWBEznfuhk1247t1YRCHtd.a2",  # admin123
        "role": "admin",
    },
    "user": {
        "username": "user",
        "full_name": "Usuario Demo",
        "hashed_password": "$2b$12$uknW0wL.ymI9RCph4ohWQ.h8axPtsIfETvQM/Kh41NuHVhyWm0JzC",  # user123
        "role": "user",
    },
}


def authenticate_user(username: str, password: str):
    """Validate credentials against the users database.

    Args:
        username: The login identifier.
        password: The plaintext password to verify.

    Returns:
        The user dictionary if credentials match, otherwise None.
    """
    user = USERS_DB.get(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user


def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    """Decode and validate the JWT bearer token from the Authorization header.

    Args:
        token: The OAuth2 bearer token string.

    Returns:
        A UserOut DTO with the authenticated user's profile.

    Raises:
        HTTPException(401): If the token is invalid or the user no longer exists.
    """
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    username = payload.get("sub")
    user = USERS_DB.get(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return UserOut(
        username=user["username"], full_name=user["full_name"], role=user["role"]
    )


def require_admin(current_user: Annotated[UserOut, Depends(get_current_user)]) -> UserOut:
    """Dependency that enforces admin-only access to an endpoint.

    Args:
        current_user: The authenticated user resolved by get_current_user.

    Returns:
        The same user object if the role is 'admin'.

    Raises:
        HTTPException(403): If the user role is not 'admin'.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate a user and issue a JWT access token.

    Args:
        form_data: OAuth2 password credentials (username + password).

    Returns:
        A Token DTO containing the signed JWT.

    Raises:
        HTTPException(401): If credentials are invalid.
    """
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: UserOut = Depends(get_current_user)):
    """Return the currently authenticated user's profile.

    Args:
        current_user: Injected authenticated user.

    Returns:
        The user's public profile information.
    """
    return current_user
