from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.services.customer_service import CustomerService
from backend.services.order_service import OrderService

router = APIRouter(
    tags=["Merchants & Admin"]
)


@router.get("/api/admin/customers", response_model=List[schemas.CustomerResponse])
def admin_get_customers(
    merchant_id: Optional[str] = Query(None, description="Filter by merchant"),
    db: Session = Depends(get_db)
):
    return CustomerService.list_customers(db, merchant_id)


@router.get("/api/admin/orders", response_model=List[schemas.OrderResponse])
def admin_get_orders(
    merchant_id: Optional[str] = Query(None, description="Filter by merchant"),
    db: Session = Depends(get_db)
):
    return OrderService.list_all_orders(db, merchant_id)


@router.get("/api/admin/activity", response_model=List[schemas.AdminActivityItemSchema])
def admin_get_activity(
    merchant_id: Optional[str] = Query(None, description="Filter by merchant"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(models.AuditEvent)
    if merchant_id:
        query = query.filter(models.AuditEvent.merchant_id == merchant_id)
    audits = query.order_by(models.AuditEvent.timestamp.desc()).limit(limit).all()

    return [
        schemas.AdminActivityItemSchema(
            id=a.id,
            merchantId=a.merchant_id,
            timestamp=a.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            agent=a.agent,
            stage=a.stage,
            title=a.title,
            description=a.description or "",
            toolUsed=a.tool_used,
            customerName=a.customer_name,
            status=a.status
        )
        for a in audits
    ]


@router.get("/api/merchants")
def list_merchants(db: Session = Depends(get_db)):
    """List distinct active merchants from catalog"""
    merchants = db.query(models.Product.merchant_id).distinct().all()
    merchant_ids = [m[0] for m in merchants if m[0]]
    return {
        "merchants": merchant_ids,
        "count": len(merchant_ids)
    }


@router.get("/api/merchants/{merchant_id}")
def get_merchant_overview(merchant_id: str, db: Session = Depends(get_db)):
    """Get high-level summary metrics for a specific merchant"""
    product_count = db.query(models.Product).filter(models.Product.merchant_id == merchant_id).count()
    order_count = db.query(models.Order).filter(models.Order.merchant_id == merchant_id).count()
    customer_count = db.query(models.Customer).filter(models.Customer.merchant_id == merchant_id).count()

    if product_count == 0 and order_count == 0 and customer_count == 0:
        raise HTTPException(status_code=404, detail=f"Merchant '{merchant_id}' not found.")

    return {
        "merchantId": merchant_id,
        "productCount": product_count,
        "orderCount": order_count,
        "customerCount": customer_count
    }
