"""Issues router providing CRUD operations, filtering, pagination, and KPI summary."""
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
import logging
from app.api.auth import get_current_user, require_admin
from app.models.schemas import (
    IssueCreate,
    IssueUpdate,
    IssueOut,
    SummaryOut,
    Status,
    Priority,
    UserOut,
)
from app.services.firestore import get_repository

router = APIRouter(prefix="/issues", tags=["issues"])
logger = logging.getLogger(__name__)


@router.post("", response_model=IssueOut, status_code=status.HTTP_201_CREATED)
def create_issue(
    payload: IssueCreate,
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    """Create a new issue record.

    Args:
        payload: Validated issue creation data.
        current_user: Authenticated user injected by FastAPI.

    Returns:
        The newly created issue.
    """
    try:
        repo = get_repository()
        data = repo.create(payload)
        return IssueOut(**data)
    except Exception as exc:
        logger.error(f"Error creating issue: {exc}")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc


@router.get("", response_model=list[IssueOut])
def list_issues(
    current_user: Annotated[UserOut, Depends(get_current_user)],
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    limit: Optional[int] = Query(20, ge=1, le=100, description="Page size"),
    offset: Optional[int] = Query(0, ge=0, description="Records to skip"),
):
    """List issues with optional filtering and pagination.

    Args:
        current_user: Authenticated user.
        status: Optional status filter (abierto, en progreso, completado).
        priority: Optional priority filter (alta, media, baja).
        limit: Maximum records per page (default 20, max 100).
        offset: Number of records to skip for pagination.

    Returns:
        A paginated list of issues ordered by creation date descending.
    """
    try:
        status_enum = Status(status) if status else None
        priority_enum = Priority(priority) if priority else None
        repo = get_repository()
        data = repo.list_all(
            status=status_enum, priority=priority_enum, limit=limit, offset=offset
        )
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
    """Return aggregate counts of issues grouped by status.

    Args:
        current_user: Authenticated user.

    Returns:
        Summary object with total count and per-status breakdown.
    """
    try:
        repo = get_repository()
        return repo.get_summary()
    except Exception as exc:
        logger.error(f"Error getting summary: {exc}")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc


@router.get("/{issue_id}", response_model=IssueOut)
def get_issue(
    issue_id: str,
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    """Retrieve a single issue by ID.

    Args:
        issue_id: The UUID of the issue.
        current_user: Authenticated user.

    Returns:
        The requested issue.

    Raises:
        HTTPException(404): If the issue does not exist.
    """
    try:
        repo = get_repository()
        data = repo.get_by_id(issue_id)
        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found"
            )
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
    """Partially update an existing issue.

    Args:
        issue_id: The UUID of the issue to update.
        payload: Fields to modify.
        current_user: Authenticated user.

    Returns:
        The updated issue.

    Raises:
        HTTPException(404): If the issue does not exist.
    """
    try:
        repo = get_repository()
        data = repo.update(issue_id, payload)
        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found"
            )
        return IssueOut(**data)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error updating issue {issue_id}: {exc}")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc


@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: str,
    current_user: Annotated[UserOut, Depends(require_admin)],
):
    """Delete an issue (admin-only).

    Args:
        issue_id: The UUID of the issue to delete.
        current_user: Admin user (enforced by require_admin dependency).

    Raises:
        HTTPException(404): If the issue does not exist.
        HTTPException(403): If the user is not an admin.
    """
    try:
        repo = get_repository()
        if not repo.delete(issue_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found"
            )
        return None
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error deleting issue {issue_id}: {exc}")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
