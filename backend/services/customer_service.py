import json
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from backend import models, schemas


def utc_now():
    return datetime.now(timezone.utc)


class CustomerService:
    @staticmethod
    def get_customer_by_id(db: Session, customer_id: str) -> Optional[schemas.CustomerResponse]:
        cust = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
        if not cust:
            return None

        # Calculate behavior & metrics from activities & orders
        activities = (
            db.query(models.CustomerActivity)
            .filter(models.CustomerActivity.customer_id == customer_id)
            .order_by(models.CustomerActivity.timestamp.desc())
            .all()
        )

        orders = (
            db.query(models.Order)
            .filter(models.Order.customer_id == customer_id, models.Order.status == "SUCCESS")
            .order_by(models.Order.created_at.desc())
            .all()
        )

        viewed_products = []
        search_queries = []
        last_viewed = None
        cart_items = []
        cart_value = 0.0

        # Current cart
        if cust.cart and cust.cart.items:
            for item in cust.cart.items:
                if item.product:
                    cart_items.append(item.product.name)
                    cart_value += item.price * item.quantity

        for act in activities:
            if act.event_type in ("PRODUCT_VIEW", "PRODUCT_VIEWED") and act.product_name:
                if act.product_name not in viewed_products:
                    viewed_products.append(act.product_name)
                if not last_viewed:
                    last_viewed = act.product_name
            elif act.event_type in ("PRODUCT_SEARCH", "SEARCH_PERFORMED"):
                meta = act.get_metadata()
                q = meta.get("query")
                if q and q not in search_queries:
                    search_queries.append(q)

        # Orders metrics
        total_orders = len(orders)
        total_spend = sum(o.total_amount for o in orders)
        avg_order = round(total_spend / total_orders, 2) if total_orders > 0 else 0.0
        last_purchase = orders[0].created_at.isoformat() if orders else None

        now = utc_now()
        created_at_val = cust.created_at
        if created_at_val and created_at_val.tzinfo is None:
            created_at_val = created_at_val.replace(tzinfo=timezone.utc)

        days_active = max(1, (now - created_at_val).days) if created_at_val else 1

        behavior = schemas.CustomerBehaviorSchema(
            viewedTimes=len(viewed_products),
            lastViewedProduct=last_viewed,
            cartValue=cart_value,
            cartItems=cart_items,
            daysActive=days_active,
            hasPurchased=total_orders > 0,
            intentScore=85 if cart_items else 70,
            preferredCategories=list(set(viewed_products)),
            viewedProducts=viewed_products[:10],
            searchQueries=search_queries[:10]
        )

        metrics = schemas.CustomerMetricsSchema(
            totalOrders=total_orders,
            totalSpend=total_spend,
            averageOrderValue=avg_order,
            lastPurchaseAt=last_purchase
        )

        return schemas.CustomerResponse(
            id=cust.id,
            merchantId=cust.merchant_id,
            name=cust.name,
            email=cust.email,
            phone=cust.phone,
            location=cust.location,
            status=cust.status,
            lifetimeValue=cust.lifetime_value + total_spend,
            avatarColor=cust.avatar_color,
            currentIntent=cust.current_intent,
            nextBestAction=cust.next_best_action,
            behavior=behavior,
            metrics=metrics,
            createdAt=cust.created_at
        )

    @staticmethod
    def list_customers(db: Session, merchant_id: Optional[str] = None) -> List[schemas.CustomerResponse]:
        query = db.query(models.Customer)
        if merchant_id:
            query = query.filter(models.Customer.merchant_id == merchant_id)
        customers = query.all()

        results = []
        for c in customers:
            resp = CustomerService.get_customer_by_id(db, c.id)
            if resp:
                results.append(resp)
        return results

    @staticmethod
    def record_activity(db: Session, request: schemas.ActivityCreateRequest) -> models.CustomerActivity:
        cust_id = request.customerId or "cust_sports_demo"
        m_id = request.merchantId or "merchant_sports"
        now = utc_now()

        activity = models.CustomerActivity(
            customer_id=cust_id,
            merchant_id=m_id,
            event_type=request.eventType,
            product_id=request.productId,
            product_name=request.productName,
            amount=request.amount or 0.0,
            activity_metadata=json.dumps(request.metadata or {}),
            timestamp=now
        )
        db.add(activity)

        # Update customer intent and status
        cust = db.query(models.Customer).filter(models.Customer.id == cust_id).first()
        if cust:
            if request.eventType in ("ADD_TO_CART", "PRODUCT_ADDED_TO_CART"):
                cust.status = "high_intent"
                cust.current_intent = "HIGH_PURCHASE_INTENT"
            elif request.eventType in ("PURCHASE_COMPLETED", "PAYMENT_SUCCESS"):
                cust.status = "active"
                cust.current_intent = "REPEAT_BUYER"
                cust.lifetime_value += (request.amount or 0.0)

        # Log audit event
        audit = models.AuditEvent(
            id=f"aud_{int(now.timestamp() * 1000)}",
            merchant_id=m_id,
            agent="INTENT" if "SEARCH" in request.eventType or "VIEW" in request.eventType else "COMMERCE",
            stage="OBSERVE",
            title=f"Activity: {request.eventType}",
            description=f"Customer {request.customerName or cust_id} triggered {request.eventType} on {request.productName or 'catalog'}.",
            tool_used="CustomerActivityAPI",
            customer_id=cust_id,
            customer_name=request.customerName or (cust.name if cust else "Shopper"),
            status="info",
            timestamp=now
        )
        db.add(audit)

        db.commit()
        db.refresh(activity)
        return activity

    @staticmethod
    def get_customer_activities(db: Session, customer_id: str, limit: int = 50) -> List[schemas.ActivityResponse]:
        acts = (
            db.query(models.CustomerActivity)
            .filter(models.CustomerActivity.customer_id == customer_id)
            .order_by(models.CustomerActivity.timestamp.desc())
            .limit(limit)
            .all()
        )
        return [
            schemas.ActivityResponse(
                id=a.id,
                customerId=a.customer_id,
                merchantId=a.merchant_id,
                eventType=a.event_type,
                productId=a.product_id,
                productName=a.product_name,
                amount=a.amount,
                metadata=a.get_metadata(),
                timestamp=a.timestamp
            )
            for a in acts
        ]

    @staticmethod
    def get_customer_orders(db: Session, customer_id: str) -> schemas.CustomerOrdersResponse:
        """
        Retrieves real order/transaction history for the specified customer_id from SQLite.
        Maps existing fields: booking_id (razorpay_order_id/id), date, amount, payment_status, payment_method.
        """
        target_ids = {customer_id}
        cust = (
            db.query(models.Customer)
            .filter((models.Customer.id == customer_id) | (models.Customer.email == customer_id))
            .first()
        )
        if cust:
            target_ids.add(cust.id)
            if cust.email:
                target_ids.add(cust.email)

        orders = (
            db.query(models.Order)
            .filter(models.Order.customer_id.in_(target_ids))
            .order_by(models.Order.created_at.desc())
            .all()
        )

        formatted_orders: List[schemas.CustomerOrderItem] = []
        for o in orders:
            # Map payment status nicely e.g. "SUCCESS" -> "Success"
            p_status = "Success"
            if o.status:
                if o.status.upper() == "SUCCESS":
                    p_status = "Success"
                elif o.status.upper() == "FAILED":
                    p_status = "Failed"
                else:
                    p_status = o.status.title()

            date_str = o.created_at.strftime("%b %d, %Y") if o.created_at else "Sep 5, 2026"

            items_schema = [
                schemas.OrderItemSchema(
                    productId=i.product_id,
                    productName=i.product_name,
                    price=i.price,
                    quantity=i.quantity,
                    isAddon=i.is_addon
                )
                for i in o.items
            ]

            formatted_orders.append(
                schemas.CustomerOrderItem(
                    order_id=o.id,
                    booking_id=o.razorpay_order_id or o.id,
                    date=o.created_at.isoformat() if o.created_at else utc_now().isoformat(),
                    formatted_date=date_str,
                    amount=float(o.total_amount),
                    payment_status=p_status,
                    payment_method=o.payment_method or "UPI",
                    status=o.status or "SUCCESS",
                    customer_id=o.customer_id,
                    customer_name=o.customer_name,
                    merchant_id=o.merchant_id,
                    base_product=o.base_product,
                    ai_addon_product=o.ai_addon_product,
                    ai_attribution=o.ai_attribution,
                    ai_attributed_revenue=float(o.ai_attributed_revenue or 0.0),
                    items=items_schema
                )
            )

        print(f"[ORDER HISTORY] customer_id = {customer_id}, orders_found = {len(formatted_orders)}")

        return schemas.CustomerOrdersResponse(
            customer_id=cust.id if cust else customer_id,
            order_count=len(formatted_orders),
            orders=formatted_orders
        )

