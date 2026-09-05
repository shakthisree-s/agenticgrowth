from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import schemas
from backend.services.customer_service import CustomerService

router = APIRouter(
    tags=["Activity"]
)


@router.post("/api/activity", response_model=schemas.ActivityResponse)
def record_activity(request: schemas.ActivityCreateRequest, db: Session = Depends(get_db)):
    act = CustomerService.record_activity(db, request)
    return schemas.ActivityResponse(
        id=act.id,
        customerId=act.customer_id,
        merchantId=act.merchant_id,
        eventType=act.event_type,
        productId=act.product_id,
        productName=act.product_name,
        amount=act.amount,
        metadata=act.get_metadata(),
        timestamp=act.timestamp
    )
