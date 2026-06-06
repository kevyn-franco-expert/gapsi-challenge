import os
import uuid
from datetime import datetime, timezone
from typing import Optional, List
import logging
from app.models.schemas import IssueCreate, IssueUpdate, Status, Priority

logger = logging.getLogger(__name__)

# Try to use Firestore; fallback to in-memory dict if not available
USE_MOCK = os.getenv("USE_MOCK_DB", "false").lower() == "true"

try:
    if USE_MOCK:
        raise ImportError("Mock mode enabled via USE_MOCK_DB")
    from google.cloud import firestore
    project_id = os.getenv("FIRESTORE_PROJECT_ID")
    if project_id:
        db = firestore.Client(project=project_id)
    else:
        db = firestore.Client()
    FIRESTORE_AVAILABLE = True
    logger.info("Firestore initialized successfully")
except Exception as exc:
    FIRESTORE_AVAILABLE = False
    db = None
    logger.warning(f"Using in-memory mock DB. Firestore not available: {exc}")

ISSUES_COLLECTION = "issues"

# In-memory fallback
_mock_db: dict[str, dict] = {}


def _now():
    return datetime.now(timezone.utc)


def create_issue(data: IssueCreate) -> dict:
    doc_id = str(uuid.uuid4())
    now = _now()
    issue_data = {
        "id": doc_id,
        "title": data.title,
        "description": data.description,
        "priority": data.priority.value,
        "status": data.status.value,
        "created_at": now,
        "updated_at": now,
    }
    if FIRESTORE_AVAILABLE:
        doc_ref = db.collection(ISSUES_COLLECTION).document(doc_id)
        doc_ref.set(issue_data)
    else:
        _mock_db[doc_id] = issue_data
    return issue_data


def get_issue(issue_id: str) -> Optional[dict]:
    if FIRESTORE_AVAILABLE:
        doc = db.collection(ISSUES_COLLECTION).document(issue_id).get()
        return doc.to_dict() if doc.exists else None
    return _mock_db.get(issue_id)


def list_issues(status: Optional[Status] = None, priority: Optional[Priority] = None) -> List[dict]:
    if FIRESTORE_AVAILABLE:
        query = db.collection(ISSUES_COLLECTION).order_by("created_at", direction=firestore.Query.DESCENDING)
        if status:
            query = query.where("status", "==", status.value)
        if priority:
            query = query.where("priority", "==", priority.value)
        return [doc.to_dict() for doc in query.stream()]
    else:
        items = list(_mock_db.values())
        items.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)
        if status:
            items = [i for i in items if i.get("status") == status.value]
        if priority:
            items = [i for i in items if i.get("priority") == priority.value]
        return items


def update_issue(issue_id: str, data: IssueUpdate) -> Optional[dict]:
    if FIRESTORE_AVAILABLE:
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
        update_data["updated_at"] = _now()
        doc_ref.update(update_data)
        return doc_ref.get().to_dict()
    else:
        item = _mock_db.get(issue_id)
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
        item["updated_at"] = _now()
        return item


def delete_issue(issue_id: str) -> bool:
    if FIRESTORE_AVAILABLE:
        doc_ref = db.collection(ISSUES_COLLECTION).document(issue_id)
        if not doc_ref.get().exists:
            return False
        doc_ref.delete()
        return True
    if issue_id in _mock_db:
        del _mock_db[issue_id]
        return True
    return False


def get_summary() -> dict:
    if FIRESTORE_AVAILABLE:
        issues = [doc.to_dict() for doc in db.collection(ISSUES_COLLECTION).stream()]
    else:
        issues = list(_mock_db.values())
    total = len(issues)
    by_status = {
        "abierto": 0,
        "en progreso": 0,
        "completado": 0,
    }
    for issue in issues:
        st = issue.get("status")
        if st in by_status:
            by_status[st] += 1
    return {"total": total, "by_status": by_status}
