from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import schemas
from backend.services.order_service import OrderService

router = APIRouter(
    prefix="/api/cart",
    tags=["Cart"]
)


@router.post("", response_model=schemas.CartResponse)
@router.post("/", response_model=schemas.CartResponse, include_in_schema=False)
def add_to_cart(request: schemas.CartItemAddRequest, db: Session = Depends(get_db)):
    try:
        return OrderService.add_to_cart(db, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{customer_id}", response_model=schemas.CartResponse)
def get_cart(customer_id: str, db: Session = Depends(get_db)):
    return OrderService.get_cart(db, customer_id)


@router.delete("/{customer_id}/items/{product_id}", response_model=schemas.CartResponse)
def remove_from_cart(customer_id: str, product_id: str, db: Session = Depends(get_db)):
    return OrderService.remove_from_cart(db, customer_id, product_id)


@router.delete("/{customer_id}", response_model=schemas.CartResponse)
def clear_cart(customer_id: str, db: Session = Depends(get_db)):
    return OrderService.clear_cart(db, customer_id)
