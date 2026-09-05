from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import schemas
from backend.services.customer_service import CustomerService

router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"]
)


@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    cust = CustomerService.get_customer_by_id(db, customer_id)
    if not cust:
        raise HTTPException(status_code=404, detail=f"Customer '{customer_id}' not found.")
    return cust


@router.get("/{customer_id}/activity", response_model=List[schemas.ActivityResponse])
def get_customer_activity(
    customer_id: str,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    return CustomerService.get_customer_activities(db, customer_id, limit=limit)
