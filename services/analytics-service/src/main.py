"""Analytics microservice entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.analytics import router as analytics_router
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s"
)

app = FastAPI(
    title="Analytics Service",
    description="Financial analytics and reporting microservice",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(analytics_router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "analytics-service"}
