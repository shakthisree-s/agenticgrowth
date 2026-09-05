from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database import get_db, init_db
from backend import models, schemas
from backend.routers import (
    products,
    customers,
    activity,
    cart,
    orders,
    recommendations,
    payments,
    merchants,
    razorpay,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and populate seed data
    init_db()
    yield


app = FastAPI(
    title="MerchantOS AI Backend",
    description="Real FastAPI + SQLite + SQLAlchemy backend with Contextual Upsell and Cross-Sell AI Recommendation Engine.",
    version="1.0.0",
    lifespan=lifespan
)

# ---------------------------------------------------------------------------
# CORS Configuration (Vite Frontend Origins & Local Ports)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health Check Endpoint
# ---------------------------------------------------------------------------
@app.get("/api/health", response_model=schemas.HealthResponse, tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    try:
        db.query(models.Product).first()
        db_status = "connected"
    except Exception:
        db_status = "error"

    return schemas.HealthResponse(
        status="ok",
        service="MerchantOS Backend",
        database=db_status
    )


# ---------------------------------------------------------------------------
# Include Modular APIRouters
# ---------------------------------------------------------------------------
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(activity.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(recommendations.router)
app.include_router(payments.router)
app.include_router(merchants.router)
app.include_router(razorpay.router)
