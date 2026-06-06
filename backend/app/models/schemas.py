from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class Priority(str, Enum):
    HIGH = "alta"
    MEDIUM = "media"
    LOW = "baja"


class Status(str, Enum):
    OPEN = "abierto"
    IN_PROGRESS = "en progreso"
    COMPLETED = "completado"


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    username: str
    full_name: str
    role: str = "Admin"


class IssueBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    priority: Priority
    status: Status = Status.OPEN


class IssueCreate(IssueBase):
    pass


from typing import Optional

class IssueUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    priority: Optional[Priority] = None
    status: Optional[Status] = None


class IssueOut(IssueBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class IssueFilter(BaseModel):
    status: Optional[Status] = None
    priority: Optional[Priority] = None


class SummaryOut(BaseModel):
    total: int
    by_status: dict[str, int]
