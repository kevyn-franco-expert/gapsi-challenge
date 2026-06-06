from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.security import verify_password, create_access_token, decode_token
from app.models.schemas import Token, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Pre-seeded users (hashed passwords)
USERS_DB = {
    "admin": {
        "username": "admin",
        "full_name": "Administrador",
        "hashed_password": "$2b$12$32a.g7a4x6kaGwfONCsGXemnteH6ZWBEznfuhk1247t1YRCHtd.a2",  # "admin123"
        "role": "Admin",
    },
    "user": {
        "username": "user",
        "full_name": "Usuario Demo",
        "hashed_password": "$2b$12$uknW0wL.ymI9RCph4ohWQ.h8axPtsIfETvQM/Kh41NuHVhyWm0JzC",  # "user123"
        "role": "User",
    },
}


def authenticate_user(username: str, password: str):
    user = USERS_DB.get(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user


def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    username = payload.get("sub")
    user = USERS_DB.get(username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return UserOut(username=user["username"], full_name=user["full_name"], role=user["role"])


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
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
    return current_user
