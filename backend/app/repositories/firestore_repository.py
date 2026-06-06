"""
Firestore implementation of the IssueRepository interface.

Uses Google Cloud Firestore for production-grade persistence with
composite query support and server-side ordering.
"""
import logging
from datetime import datetime, timezone
from typing import Optional, List

from app.models.schemas import IssueCreate, IssueUpdate, Status, Priority
from app.repositories.base import IssueRepository

logger = logging.getLogger(__name__)

# Firestore client initialization
try:
    from google.cloud import firestore
    import os

    project_id = os.getenv("FIRESTORE_PROJECT_ID")
    db = firestore.Client(project=project_id) if project_id else firestore.Client()
    logger.info("Firestore client initialized for production")
except Exception as exc:
    db = None
    logger.error(f"Failed to initialize Firestore client: {exc}")

ISSUES_COLLECTION = "issues"


class FirestoreIssueRepository(IssueRepository):
    """Production repository backed by Google Cloud Firestore."""

    def _now(self) -> datetime:
        """Return current UTC timestamp."""
        return datetime.now(timezone.utc)

    def create(self, data: IssueCreate) -> dict:
        """Persist a new issue into Firestore."""
        doc_ref = db.collection(ISSUES_COLLECTION).document()
        now = self._now()
        issue_data = {
            "id": doc_ref.id,
            "title": data.title,
            "description": data.description,
            "priority": data.priority.value,
            "status": data.status.value,
            "created_at": now,
            "updated_at": now,
        }
        doc_ref.set(issue_data)
        logger.info(f"Created issue {doc_ref.id}")
        return issue_data

    def get_by_id(self, issue_id: str) -> Optional[dict]:
        """Fetch a single issue document from Firestore."""
        doc = db.collection(ISSUES_COLLECTION).document(issue_id).get()
        return doc.to_dict() if doc.exists else None

    def list_all(
        self,
        status: Optional[Status] = None,
        priority: Optional[Priority] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> List[dict]:
        """Query Firestore with optional filters, ordering, and pagination."""
        query = db.collection(ISSUES_COLLECTION).order_by(
            "created_at", direction=firestore.Query.DESCENDING
        )

        if status:
            query = query.where("status", "==", status.value)
        if priority:
            query = query.where("priority", "==", priority.value)
        if limit is not None:
            query = query.limit(limit)
        if offset is not None:
            query = query.offset(offset)

        return [doc.to_dict() for doc in query.stream()]

    def update(self, issue_id: str, data: IssueUpdate) -> Optional[dict]:
        """Apply a partial update to a Firestore document."""
        doc_ref = db.collection(ISSUES_COLLECTION).document(issue_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None

        update_data = {}
        if data.title is not None:
            update_data["title"] = data.title
        if data.description is not None:
            update_data["description"] = data.description
        if data.priority is not None:
            update_data["priority"] = data.priority.value
        if data.status is not None:
            update_data["status"] = data.status.value
        update_data["updated_at"] = self._now()

        doc_ref.update(update_data)
        logger.info(f"Updated issue {issue_id}")
        return doc_ref.get().to_dict()

    def delete(self, issue_id: str) -> bool:
        """Remove an issue document from Firestore."""
        doc_ref = db.collection(ISSUES_COLLECTION).document(issue_id)
        if not doc_ref.get().exists:
            return False
        doc_ref.delete()
        logger.info(f"Deleted issue {issue_id}")
        return True

    def get_summary(self) -> dict:
        """Aggregate issue counts by status using a Firestore scan."""
        issues = [doc.to_dict() for doc in db.collection(ISSUES_COLLECTION).stream()]
        total = len(issues)
        by_status = {"abierto": 0, "en progreso": 0, "completado": 0}
        for issue in issues:
            st = issue.get("status")
            if st in by_status:
                by_status[st] += 1
        return {"total": total, "by_status": by_status}
