"""Report generation service — builds exportable reports from analytics data."""
import logging
from datetime import datetime
from typing import Any
from .transaction_analytics import TransactionAnalyticsService, TransactionSummary

logger = logging.getLogger(__name__)


class ReportGenerator:
    """Generates structured reports from analytics data."""

    def __init__(self):
        self._analytics = TransactionAnalyticsService()

    def generate_daily_report(self, transactions: list[dict]) -> dict[str, Any]:
        """Generate a full daily report with KPIs.

        Args:
            transactions: Raw transaction records for the day.

        Returns:
            Structured report dict ready for serialization.
        """
        summary = self._analytics.compute_daily_summary(transactions)
        success_rate = self._analytics.compute_success_rate(summary.by_status)

        report = {
            "generated_at": datetime.utcnow().isoformat(),
            "period": {
                "start": summary.period_start.isoformat(),
                "end": summary.period_end.isoformat()
            },
            "kpis": {
                "total_transactions": summary.total_count,
                "total_volume": summary.total_volume,
                "average_amount": summary.average_amount,
                "success_rate_pct": success_rate,
                "currency": summary.currency
            },
            "breakdown": {
                "by_type": summary.by_type,
                "by_status": summary.by_status
            }
        }

        logger.info("Daily report generated | transactions=%d", summary.total_count)
        return report

    def generate_summary_csv(self, summary: TransactionSummary) -> str:
        """Export a transaction summary as CSV string."""
        lines = [
            "period_start,period_end,total_count,total_volume,average_amount",
            f"{summary.period_start},{summary.period_end},"
            f"{summary.total_count},{summary.total_volume:.2f},{summary.average_amount:.2f}"
        ]
        return "\n".join(lines)
