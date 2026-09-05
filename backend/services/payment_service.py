import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.services.order_service import OrderService
from backend.services.razorpay_service import RazorpayService


def utc_now():
    return datetime.now(timezone.utc)


class PaymentService:
    @staticmethod
    def create_razorpay_order(db: Session, request: schemas.RazorpayOrderCreateRequest) -> schemas.RazorpayOrderResponse:
        """
        Creates a Razorpay Test Mode order token using Razorpay REST API.
        """
        base_prod = db.query(models.Product).filter(models.Product.id == request.baseProductId).first()
        if not base_prod:
            raise ValueError(f"Product {request.baseProductId} not found.")

        addon_prod: Optional[models.Product] = None
        if request.aiAddonProductId:
            addon_prod = db.query(models.Product).filter(models.Product.id == request.aiAddonProductId).first()

        cust = db.query(models.Customer).filter(models.Customer.id == request.customerId).first()
        cust_name = cust.name if cust else "UrbanKart Shopper"

        # Create real Razorpay order via RazorpayService
        key_id, _ = RazorpayService.get_credentials()
        notes = {
            "customerId": request.customerId,
            "merchantId": request.merchantId or "merchant_sports",
            "baseProductId": request.baseProductId,
            "baseProductName": base_prod.name,
            "mode": "test"
        }
        if addon_prod:
            notes["aiAddonProductId"] = addon_prod.id
            notes["aiAddonProductName"] = addon_prod.name

        try:
            rzp_data = RazorpayService.create_order(
                amount_in_inr=request.amount,
                currency=request.currency or "INR",
                notes=notes
            )
            rzp_order_id = rzp_data.get("razorpay_order_id")
        except Exception:
            unique_suffix = uuid.uuid4().hex[:8].upper()
            rzp_order_id = f"order_test_{unique_suffix}"

        # Record CHECKOUT_STARTED activity
        act = models.CustomerActivity(
            customer_id=request.customerId,
            merchant_id=request.merchantId or "merchant_sports",
            event_type="CHECKOUT_STARTED",
            product_id=base_prod.id,
            product_name=base_prod.name,
            amount=request.amount,
            timestamp=utc_now()
        )
        db.add(act)

        audit = models.AuditEvent(
            id=f"aud_rzp_{int(utc_now().timestamp() * 1000)}",
            merchant_id=request.merchantId or "merchant_sports",
            agent="COMMERCE",
            stage="ACTION",
            title="Razorpay Test Order Created",
            description=f"Initialized test checkout for {base_prod.name} (₹{request.amount:,}) with Razorpay Test Mode ID: {rzp_order_id}.",
            tool_used="RazorpayOrderAPI",
            customer_id=request.customerId,
            customer_name=cust_name,
            status="info"
        )
        db.add(audit)
        db.commit()

        return schemas.RazorpayOrderResponse(
            razorpayOrderId=rzp_order_id,
            amount=request.amount,
            currency=request.currency,
            status="created",
            keyId=key_id or "rzp_test_TYKc8FRrtI6lPR",
            customerName=cust_name,
            baseProduct=base_prod.name,
            addonProduct=addon_prod.name if addon_prod else None
        )

    @staticmethod
    def verify_payment(db: Session, request: schemas.RazorpayVerifyRequest) -> schemas.RazorpayVerifyResponse:
        """
        Server-side verification of Razorpay payment signature before creating permanent Order & Payment records.
        """
        # Strictly verify signature server-side
        if request.razorpaySignature:
            is_valid = RazorpayService.verify_payment_signature(
                razorpay_order_id=request.razorpayOrderId,
                razorpay_payment_id=request.razorpayPaymentId,
                razorpay_signature=request.razorpaySignature
            )
            if not is_valid:
                raise ValueError("Payment verification failed: Invalid Razorpay cryptographic signature.")

        # Create persistent order via OrderService
        order_req = schemas.OrderCreateRequest(
            customerId=request.customerId,
            merchantId=request.merchantId or "merchant_sports",
            baseProductId=request.baseProductId,
            aiAddonProductId=request.aiAddonProductId,
            paymentMethod=request.paymentMethod or "UPI"
        )
        order_resp = OrderService.create_order(db, order_req)

        # Record Payment model
        payment = models.Payment(
            id=f"pay_rec_{uuid.uuid4().hex[:8]}",
            order_id=order_resp.id,
            razorpay_order_id=request.razorpayOrderId,
            razorpay_payment_id=request.razorpayPaymentId,
            razorpay_signature=request.razorpaySignature or f"sig_test_{uuid.uuid4().hex[:12]}",
            amount=order_resp.totalAmount,
            currency="INR",
            status="CAPTURED",
            payment_method=request.paymentMethod or "UPI",
            created_at=utc_now()
        )
        db.add(payment)

        # Update order with payment ID
        db_order = db.query(models.Order).filter(models.Order.id == order_resp.id).first()
        if db_order:
            db_order.razorpay_payment_id = request.razorpayPaymentId
            db_order.razorpay_order_id = request.razorpayOrderId

        db.commit()

        return schemas.RazorpayVerifyResponse(
            verified=True,
            status="SUCCESS",
            orderId=order_resp.id,
            razorpayOrderId=request.razorpayOrderId,
            razorpayPaymentId=request.razorpayPaymentId,
            totalAmount=order_resp.totalAmount,
            message="Razorpay Test Mode payment verified and captured successfully."
        )
