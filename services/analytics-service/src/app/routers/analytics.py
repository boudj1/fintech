"""Analytics API router — exposes reporting and metrics endpoints."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from ..services.transaction_analytics import TransactionAnalyticsService
from ..services.report_generator import ReportGenerator
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

_analytics = TransactionAnalyticsService()
_report_gen = ReportGenerator()


class TransactionPayload(BaseModel):
    transactions: list[dict]


@router.post("/summary")
def compute_summary(payload: TransactionPayload):
    """Compute aggregated metrics from a batch of transactions."""
    summary = _analytics.compute_daily_summary(payload.transactions)
    success_rate = _analytics.compute_success_rate(summary.by_status)
    return {
        "period_start": summary.period_start.isoformat(),
        "period_end": summary.period_end.isoformat(),
        "total_count": summary.total_count,
        "total_volume": summary.total_volume,
        "average_amount": summary.average_amount,
        "success_rate_pct": success_rate,
        "currency": summary.currency,
        "by_type": summary.by_type,
        "by_status": summary.by_status
    }


@router.post("/report/daily")
def generate_daily_report(payload: TransactionPayload):
    """Generate a full daily report including KPIs and breakdown."""
    if not payload.transactions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No transactions provided for report generation"
        )
    report = _report_gen.generate_daily_report(payload.transactions)
    logger.info("Daily report requested | transactions=%d", len(payload.transactions))
    return report


@router.post("/report/csv")
def export_summary_csv(payload: TransactionPayload):
    """Export transaction summary as CSV text."""
    summary = _analytics.compute_daily_summary(payload.transactions)
    csv_data = _report_gen.generate_summary_csv(summary)
    return {"csv": csv_data}
