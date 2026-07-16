"""Transaction analytics service — computes aggregated financial metrics."""
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)


@dataclass
class TransactionSummary:
    """Aggregated transaction metrics for a given period."""
    period_start: datetime
    period_end: datetime
    total_count: int = 0
    total_volume: float = 0.0
    average_amount: float = 0.0
    by_type: dict = field(default_factory=dict)
    by_status: dict = field(default_factory=dict)
    currency: str = "DZD"


class TransactionAnalyticsService:
    """Computes analytics and KPIs from transaction data."""

    def compute_daily_summary(
        self,
        transactions: list[dict],
        date: Optional[datetime] = None
    ) -> TransactionSummary:
        """Compute a daily transaction summary.

        Args:
            transactions: List of transaction dicts with amount, type, status fields.
            date: The target date (defaults to today).
        """
        target = date or datetime.utcnow()
        period_start = target.replace(hour=0, minute=0, second=0, microsecond=0)
        period_end = period_start + timedelta(days=1)

        summary = TransactionSummary(period_start=period_start, period_end=period_end)

        if not transactions:
            return summary

        summary.total_count = len(transactions)
        total = sum(float(tx.get("amount", 0)) for tx in transactions)
        summary.total_volume = total
        summary.average_amount = total / len(transactions)

        for tx in transactions:
            tx_type = tx.get("type", "UNKNOWN")
            summary.by_type[tx_type] = summary.by_type.get(tx_type, 0) + 1

            tx_status = tx.get("status", "UNKNOWN")
            summary.by_status[tx_status] = summary.by_status.get(tx_status, 0) + 1

        logger.info(
            "Daily summary computed | count=%d volume=%.2f",
            summary.total_count, summary.total_volume
        )
        return summary

    def compute_success_rate(self, by_status: dict) -> float:
        """Compute the transaction success rate as a percentage."""
        total = sum(by_status.values())
        if total == 0:
            return 0.0
        completed = by_status.get("COMPLETED", 0)
        return round((completed / total) * 100, 2)
