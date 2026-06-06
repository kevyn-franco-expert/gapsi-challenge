"""
Repository factory module.

Provides a singleton-like access to the configured IssueRepository
implementation (Firestore for production, InMemory for local dev/tests).
This module acts as a dependency-injection facade for the API layer.
"""
import os
import logging
from app.repositories.firestore_repository import FirestoreIssueRepository
from app.repositories.memory_repository import InMemoryIssueRepository

logger = logging.getLogger(__name__)

# Determine which repository to instantiate based on environment
USE_MOCK = os.getenv("USE_MOCK_DB", "false").lower() == "true"

if USE_MOCK:
    _repo = InMemoryIssueRepository()
    logger.info("Using InMemoryIssueRepository (USE_MOCK_DB=true)")
else:
    try:
        _repo = FirestoreIssueRepository()
        logger.info("Using FirestoreIssueRepository")
    except Exception as exc:
        logger.warning(f"Firestore unavailable, falling back to memory: {exc}")
        _repo = InMemoryIssueRepository()


def get_repository():
    """Return the active IssueRepository singleton.

    This function is injected into FastAPI endpoints via Depends()
    to provide loose coupling between API and persistence layers.
    """
    return _repo
