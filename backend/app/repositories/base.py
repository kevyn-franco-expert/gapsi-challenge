"""
Base repository module defining the abstract interface for issue persistence.

This module implements the Repository Pattern, providing a clean abstraction
between the business logic (API layer) and the data access layer (Firestore/mock).
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from app.models.schemas import IssueCreate, IssueUpdate, Status, Priority


class IssueRepository(ABC):
    """Abstract base class defining the contract for issue data access.

    All concrete implementations (Firestore, In-Memory, SQL, etc.) must
    adhere to this interface, enabling swappable persistence layers.
    """

    @abstractmethod
    def create(self, data: IssueCreate) -> dict:
        """Create a new issue record.

        Args:
            data: Validated issue creation payload.

        Returns:
            The created issue as a dictionary including generated id and timestamps.
        """
        raise NotImplementedError

    @abstractmethod
    def get_by_id(self, issue_id: str) -> Optional[dict]:
        """Retrieve a single issue by its unique identifier.

        Args:
            issue_id: The UUID of the issue to retrieve.

        Returns:
            The issue dictionary if found, otherwise None.
        """
        raise NotImplementedError

    @abstractmethod
    def list_all(
        self,
        status: Optional[Status] = None,
        priority: Optional[Priority] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> List[dict]:
        """List issues with optional filtering and pagination.

        Args:
            status: Filter by issue status.
            priority: Filter by issue priority.
            limit: Maximum number of records to return (page size).
            offset: Number of records to skip (for pagination).

        Returns:
            A list of issue dictionaries ordered by creation date descending.
        """
        raise NotImplementedError

    @abstractmethod
    def update(self, issue_id: str, data: IssueUpdate) -> Optional[dict]:
        """Update an existing issue partially.

        Args:
            issue_id: The UUID of the issue to update.
            data: Validated patch payload with fields to modify.

        Returns:
            The updated issue dictionary if found, otherwise None.
        """
        raise NotImplementedError

    @abstractmethod
    def delete(self, issue_id: str) -> bool:
        """Delete an issue by its unique identifier.

        Args:
            issue_id: The UUID of the issue to delete.

        Returns:
            True if the issue existed and was deleted, False otherwise.
        """
        raise NotImplementedError

    @abstractmethod
    def get_summary(self) -> dict:
        """Compute aggregate counts of issues grouped by status.

        Returns:
            A dictionary with 'total' count and 'by_status' breakdown.
        """
        raise NotImplementedError
