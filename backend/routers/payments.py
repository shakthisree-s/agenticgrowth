from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import schemas
from backend.services.payment_service import PaymentService

router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)


@router.post("/create-order", response_model=schemas.RazorpayOrderResponse)
def create_razorpay_order(request: schemas.RazorpayOrderCreateRequest, db: Session = Depends(get_db)):
    try:
        return PaymentService.create_razorpay_order(db, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify", response_model=schemas.RazorpayVerifyResponse)
def verify_razorpay_payment(request: schemas.RazorpayVerifyRequest, db: Session = Depends(get_db)):
    try:
        return PaymentService.verify_payment(db, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
