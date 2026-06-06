from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    PROJECT_NAME: str = "Issues Tracker API"
    VERSION: str = "1.0.0"
    SECRET_KEY: str  # No default — must be provided via env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    FIRESTORE_PROJECT_ID: Optional[str] = None
    USE_MOCK_DB: bool = False
    ALLOWED_ORIGINS: str = "http://localhost:4200"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
