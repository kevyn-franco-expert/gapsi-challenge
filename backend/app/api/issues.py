from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
import logging
from app.api.auth import get_current_user
from app.models.schemas import (
    IssueCreate,
    IssueUpdate,
    IssueOut,
    SummaryOut,
    Status,
    Priority,
    UserOut,
)
from app.services import firestore as fs

router = APIRouter(prefix="/issues", tags=["issues"])
logger = logging.getLogger(__name__)


@router.post("", response_model=IssueOut, status_code=status.HTTP_201_CREATED)
def create_issue(
    payload: IssueCreate,
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    try:
        data = fs.create_issue(payload)
        return IssueOut(**data)
    except Exception as exc:
        logger.error(f"Error creating issue: {exc}")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc


@router.get("", response_model=list[IssueOut])
def list_issues(
    current_user: Annotated[UserOut, Depends(get_current_user)],
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
):
    try:
        status_enum = Status(status) if status else None
        priority_enum = Priority(priority) if priority else None
        data = fs.list_issues(status=status_enum, priority=priority_enum)
        return [IssueOut(**item) for item in data]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid filter value: {exc}") from exc
    except Exception as exc:
        logger.error(f"Error listing issues: {exc}")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc


@router.get("/summary", response_model=SummaryOut)
def get_summary(
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    try:
        return fs.get_summary()
    except Exception as exc:
        logger.error(f"Error getting summary: {exc}")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc


@router.get("/{issue_id}", response_model=IssueOut)
def get_issue(
    issue_id: str,
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    try:
        data = fs.get_issue(issue_id)
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
        return IssueOut(**data)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error getting issue {issue_id}: {exc}")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc


@router.patch("/{issue_id}", response_model=IssueOut)
def update_issue(
    issue_id: str,
    payload: IssueUpdate,
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    try:
        data = fs.update_issue(issue_id, payload)
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
        return IssueOut(**data)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error updating issue {issue_id}: {exc}")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc


@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: str,
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    try:
        if not fs.delete_issue(issue_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
        return None
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error deleting issue {issue_id}: {exc}")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
