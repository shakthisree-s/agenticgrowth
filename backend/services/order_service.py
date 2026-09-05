from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from backend import models, schemas


def utc_now():
    return datetime.now(timezone.utc)


class OrderService:
    # -------------------------------------------------------------------------
    # Cart Operations
    # -------------------------------------------------------------------------
    @staticmethod
    def get_or_create_cart(db: Session, customer_id: str, merchant_id: str = "merchant_sports") -> models.Cart:
        cart = db.query(models.Cart).filter(models.Cart.customer_id == customer_id).first()
        if not cart:
            cart = models.Cart(
                id=f"cart_{customer_id}",
                customer_id=customer_id,
                merchant_id=merchant_id,
                created_at=utc_now()
            )
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart

    @staticmethod
    def add_to_cart(db: Session, request: schemas.CartItemAddRequest) -> schemas.CartResponse:
        cart = OrderService.get_or_create_cart(db, request.customerId, request.merchantId or "merchant_sports")

        product = db.query(models.Product).filter(models.Product.id == request.productId).first()
        if not product:
            raise ValueError(f"Product with id {request.productId} not found.")

        # Check if item already exists in cart
        existing_item = (
            db.query(models.CartItem)
            .filter(models.CartItem.cart_id == cart.id, models.CartItem.product_id == request.productId)
            .first()
        )

        if existing_item:
            existing_item.quantity += request.quantity
            existing_item.is_ai_recommended = existing_item.is_ai_recommended or request.isAiRecommended
        else:
            new_item = models.CartItem(
                cart_id=cart.id,
                product_id=product.id,
                quantity=request.quantity,
                price=product.price,
                is_ai_recommended=request.isAiRecommended
            )
            db.add(new_item)

        cart.updated_at = utc_now()

        # Log Activity
        act = models.CustomerActivity(
            customer_id=request.customerId,
            merchant_id=cart.merchant_id,
            event_type="ADD_TO_CART",
            product_id=product.id,
            product_name=product.name,
            amount=product.price * request.quantity,
            timestamp=utc_now()
        )
        db.add(act)

        # Log Audit
        audit = models.AuditEvent(
            id=f"aud_cart_{int(utc_now().timestamp() * 1000)}",
            merchant_id=cart.merchant_id,
            agent="INTENT",
            stage="ACTION",
            title="Item Added to Cart",
            description=f"Added {product.name} (₹{product.price}) to cart. AI Recommended: {request.isAiRecommended}.",
            tool_used="CartService",
            customer_id=request.customerId,
            status="success"
        )
        db.add(audit)

        db.commit()
        return OrderService.get_cart(db, request.customerId)

    @staticmethod
    def remove_from_cart(db: Session, customer_id: str, product_id: str) -> schemas.CartResponse:
        cart = db.query(models.Cart).filter(models.Cart.customer_id == customer_id).first()
        if cart:
            db.query(models.CartItem).filter(
                models.CartItem.cart_id == cart.id,
                models.CartItem.product_id == product_id
            ).delete()

            cart.updated_at = utc_now()

            act = models.CustomerActivity(
                customer_id=customer_id,
                merchant_id=cart.merchant_id,
                event_type="REMOVE_FROM_CART",
                product_id=product_id,
                timestamp=utc_now()
            )
            db.add(act)
            db.commit()

        return OrderService.get_cart(db, customer_id)

    @staticmethod
    def clear_cart(db: Session, customer_id: str) -> schemas.CartResponse:
        cart = db.query(models.Cart).filter(models.Cart.customer_id == customer_id).first()
        if cart:
            db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).delete()
            cart.updated_at = utc_now()
            db.commit()
        return OrderService.get_cart(db, customer_id)

    @staticmethod
    def get_cart(db: Session, customer_id: str) -> schemas.CartResponse:
        cart = db.query(models.Cart).filter(models.Cart.customer_id == customer_id).first()
        if not cart or not cart.items:
            return schemas.CartResponse(
                customerId=customer_id,
                merchantId="merchant_sports",
                items=[],
                totalItems=0,
                subtotal=0.0
            )

        items_resp = []
        subtotal = 0.0
        total_items = 0

        for item in cart.items:
            prod = item.product
            if prod:
                item_total = item.price * item.quantity
                subtotal += item_total
                total_items += item.quantity
                items_resp.append(
                    schemas.CartItemResponse(
                        productId=prod.id,
                        productName=prod.name,
                        price=prod.price,
                        quantity=item.quantity,
                        isAiRecommended=item.is_ai_recommended,
                        image=prod.image,
                        category=prod.category
                    )
                )

        return schemas.CartResponse(
            customerId=customer_id,
            merchantId=cart.merchant_id,
            items=items_resp,
            totalItems=total_items,
            subtotal=round(subtotal, 2),
            updatedAt=cart.updated_at
        )

    # -------------------------------------------------------------------------
    # Order Operations
    # -------------------------------------------------------------------------
    @staticmethod
    def create_order(db: Session, request: schemas.OrderCreateRequest) -> schemas.OrderResponse:
        base_prod = db.query(models.Product).filter(models.Product.id == request.baseProductId).first()
        if not base_prod:
            raise ValueError(f"Base product {request.baseProductId} not found.")

        addon_prod: Optional[models.Product] = None
        if request.aiAddonProductId:
            addon_prod = db.query(models.Product).filter(models.Product.id == request.aiAddonProductId).first()

        base_amount = base_prod.price
        addon_amount = addon_prod.price if addon_prod else 0.0
        total_amount = base_amount + addon_amount

        cust = db.query(models.Customer).filter(models.Customer.id == request.customerId).first()
        cust_name = request.customerName or (cust.name if cust else "UrbanKart Shopper")

        timestamp_str = utc_now().strftime("%Y%m%d%H%M%S")
        order_id = f"ORD_{request.merchantId or 'sports'}_{timestamp_str}_{int(total_amount)}"
        rzp_order_id = f"order_test_{timestamp_str}"
        rzp_payment_id = f"pay_test_{timestamp_str}"

        ai_attribution = "AI Cross-sell" if addon_prod else "Direct"
        ai_attributed_revenue = addon_amount if addon_prod else 0.0

        order = models.Order(
            id=order_id,
            customer_id=request.customerId,
            customer_name=cust_name,
            merchant_id=request.merchantId or "merchant_sports",
            razorpay_order_id=rzp_order_id,
            razorpay_payment_id=rzp_payment_id,
            base_product=base_prod.name,
            base_amount=base_amount,
            ai_addon_product=addon_prod.name if addon_prod else None,
            ai_addon_amount=addon_amount,
            total_amount=total_amount,
            status="SUCCESS",
            payment_method=request.paymentMethod or "UPI",
            ai_attribution=ai_attribution,
            ai_attributed_revenue=ai_attributed_revenue,
            created_at=utc_now()
        )
        db.add(order)
        db.flush()

        # Add Order Items
        base_item = models.OrderItem(
            order_id=order.id,
            product_id=base_prod.id,
            product_name=base_prod.name,
            price=base_prod.price,
            quantity=1,
            is_addon=False
        )
        db.add(base_item)

        if addon_prod:
            addon_item = models.OrderItem(
                order_id=order.id,
                product_id=addon_prod.id,
                product_name=addon_prod.name,
                price=addon_prod.price,
                quantity=1,
                is_addon=True
            )
            db.add(addon_item)

        # Clear cart on order creation
        OrderService.clear_cart(db, request.customerId)

        # Record activity & audit
        act = models.CustomerActivity(
            customer_id=request.customerId,
            merchant_id=order.merchant_id,
            event_type="PURCHASE_COMPLETED",
            product_id=base_prod.id,
            product_name=base_prod.name,
            amount=total_amount,
            timestamp=utc_now()
        )
        db.add(act)

        audit = models.AuditEvent(
            id=f"aud_order_{int(utc_now().timestamp() * 1000)}",
            merchant_id=order.merchant_id,
            agent="COMMERCE",
            stage="RESULT",
            title=f"Order Placed: {order.id}",
            description=f"Captured ₹{total_amount:,} ({ai_attribution}). Base: {base_prod.name}{' + ' + addon_prod.name if addon_prod else ''}.",
            tool_used="RazorpayTestGateway",
            customer_id=request.customerId,
            customer_name=cust_name,
            status="success"
        )
        db.add(audit)

        db.commit()
        db.refresh(order)

        return OrderService._to_order_response(order)

    @staticmethod
    def get_orders_by_customer(db: Session, customer_id: str) -> List[schemas.OrderResponse]:
        orders = (
            db.query(models.Order)
            .filter(models.Order.customer_id == customer_id)
            .order_by(models.Order.created_at.desc())
            .all()
        )
        return [OrderService._to_order_response(o) for o in orders]

    @staticmethod
    def list_all_orders(db: Session, merchant_id: Optional[str] = None) -> List[schemas.OrderResponse]:
        query = db.query(models.Order)
        if merchant_id:
            query = query.filter(models.Order.merchant_id == merchant_id)
        orders = query.order_by(models.Order.created_at.desc()).all()
        return [OrderService._to_order_response(o) for o in orders]

    @staticmethod
    def _to_order_response(order: models.Order) -> schemas.OrderResponse:
        items_resp = [
            schemas.OrderItemSchema(
                productId=i.product_id,
                productName=i.product_name,
                price=i.price,
                quantity=i.quantity,
                isAddon=i.is_addon
            )
            for i in order.items
        ]

        return schemas.OrderResponse(
            id=order.id,
            customerId=order.customer_id,
            customerName=order.customer_name,
            merchantId=order.merchant_id,
            razorpayOrderId=order.razorpay_order_id,
            razorpayPaymentId=order.razorpay_payment_id,
            baseProduct=order.base_product,
            baseAmount=order.base_amount,
            aiAddonProduct=order.ai_addon_product,
            aiAddonAmount=order.ai_addon_amount,
            totalAmount=order.total_amount,
            status=order.status,
            paymentMethod=order.payment_method,
            aiAttribution=order.ai_attribution,
            aiAttributedRevenue=order.ai_attributed_revenue,
            createdAt=order.created_at,
            items=items_resp
        )
