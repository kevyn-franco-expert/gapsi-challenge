"""
In-memory implementation of the IssueRepository interface.

Intended for local development, integration testing, and environments
where Firestore credentials are unavailable.
"""
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List

from app.models.schemas import IssueCreate, IssueUpdate, Status, Priority
from app.repositories.base import IssueRepository

logger = logging.getLogger(__name__)


class InMemoryIssueRepository(IssueRepository):
    """Non-persistent repository storing issues in a process-local dictionary.

    Thread-safety note: This implementation is NOT thread-safe and should
    only be used in single-threaded contexts (development / tests).
    """

    def __init__(self) -> None:
        """Initialize an empty in-memory store."""
        self._store: dict[str, dict] = {}

    def _now(self) -> datetime:
        """Return current UTC timestamp."""
        return datetime.now(timezone.utc)

    def create(self, data: IssueCreate) -> dict:
        """Store a new issue in memory."""
        doc_id = str(uuid.uuid4())
        now = self._now()
        issue_data = {
            "id": doc_id,
            "title": data.title,
            "description": data.description,
            "priority": data.priority.value,
            "status": data.status.value,
            "created_at": now,
            "updated_at": now,
        }
        self._store[doc_id] = issue_data
        logger.info(f"[MEMORY] Created issue {doc_id}")
        return issue_data

    def get_by_id(self, issue_id: str) -> Optional[dict]:
        """Retrieve a single issue from the in-memory store."""
        return self._store.get(issue_id)

    def list_all(
        self,
        status: Optional[Status] = None,
        priority: Optional[Priority] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> List[dict]:
        """List issues from memory with optional filters and pagination."""
        items = list(self._store.values())
        items.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)

        if status:
            items = [i for i in items if i.get("status") == status.value]
        if priority:
            items = [i for i in items if i.get("priority") == priority.value]
        if offset:
            items = items[offset:]
        if limit is not None:
            items = items[:limit]

        return items

    def update(self, issue_id: str, data: IssueUpdate) -> Optional[dict]:
        """Apply a partial update to an in-memory issue record."""
        item = self._store.get(issue_id)
        if not item:
            return None

        if data.title is not None:
            item["title"] = data.title
        if data.description is not None:
            item["description"] = data.description
        if data.priority is not None:
            item["priority"] = data.priority.value
        if data.status is not None:
            item["status"] = data.status.value
        item["updated_at"] = self._now()

        logger.info(f"[MEMORY] Updated issue {issue_id}")
        return item

    def delete(self, issue_id: str) -> bool:
        """Remove an issue from the in-memory store."""
        if issue_id in self._store:
            del self._store[issue_id]
            logger.info(f"[MEMORY] Deleted issue {issue_id}")
            return True
        return False

    def get_summary(self) -> dict:
        """Aggregate issue counts from the in-memory store."""
        issues = list(self._store.values())
        total = len(issues)
        by_status = {"abierto": 0, "en progreso": 0, "completado": 0}
        for issue in issues:
            st = issue.get("status")
            if st in by_status:
                by_status[st] += 1
        return {"total": total, "by_status": by_status}
