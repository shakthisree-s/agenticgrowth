from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import schemas
from backend.services.order_service import OrderService

router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)


@router.post("", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_order(request: schemas.OrderCreateRequest, db: Session = Depends(get_db)):
    try:
        return OrderService.create_order(db, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{customer_id}", response_model=List[schemas.OrderResponse])
def get_customer_orders(customer_id: str, db: Session = Depends(get_db)):
    return OrderService.get_orders_by_customer(db, customer_id)
