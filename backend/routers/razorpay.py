from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from backend import schemas
from backend.services.razorpay_service import RazorpayService

router = APIRouter(
    prefix="/api/razorpay",
    tags=["Razorpay Test Mode"]
)


@router.get("/health", response_model=schemas.RazorpayHealthResponse)
def get_razorpay_health():
    """Check Razorpay Test Mode credentials configuration and readiness."""
    health_data = RazorpayService.get_health()
    return schemas.RazorpayHealthResponse(**health_data)


@router.post("/orders", response_model=schemas.RazorpayDirectOrderResponse, status_code=status.HTTP_201_CREATED)
def create_razorpay_order(request: schemas.RazorpayDirectOrderCreateRequest):
    """
    Create an order in Razorpay TEST MODE.
    Converts amount from INR to paise (e.g., ₹6999 -> 699900 paise).
    """
    try:
        merged_notes = dict(request.notes or {})
        if request.customer_id or request.customerId:
            merged_notes["customer_id"] = request.customer_id or request.customerId
        if request.merchant_order_id or request.merchantOrderId:
            merged_notes["merchant_order_id"] = request.merchant_order_id or request.merchantOrderId
        if request.case_id or request.caseId:
            merged_notes["case_id"] = request.case_id or request.caseId

        order_data = RazorpayService.create_order(
            amount_in_inr=request.amount,
            currency=request.currency or "INR",
            receipt=request.receipt,
            notes=merged_notes
        )
        return schemas.RazorpayDirectOrderResponse(
            success=True,
            razorpay_order_id=order_data["razorpay_order_id"],
            amount=order_data["amount"],
            currency=order_data["currency"],
            status=order_data.get("status", "created"),
            receipt=order_data.get("receipt"),
            notes=order_data.get("notes")
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while creating Razorpay order: {str(e)}"
        )


@router.get("/orders/{order_id}", response_model=schemas.RazorpayDirectOrderInfo)
def get_razorpay_order(order_id: str):
    """Retrieve an existing order from Razorpay TEST MODE."""
    try:
        data = RazorpayService.get_order(order_id)
        return schemas.RazorpayDirectOrderInfo(**data)
    except ValueError as e:
        err_str = str(e)
        if "not found" in err_str.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=err_str)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_str)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve Razorpay order '{order_id}': {str(e)}"
        )


@router.get("/orders/{order_id}/payments", response_model=schemas.RazorpayPaymentsListResponse)
def get_razorpay_order_payments(order_id: str):
    """Retrieve all payment attempts for a given Razorpay order."""
    try:
        data = RazorpayService.get_order_payments(order_id)
        return schemas.RazorpayPaymentsListResponse(**data)
    except ValueError as e:
        err_str = str(e)
        if "not found" in err_str.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=err_str)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_str)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve payments for order '{order_id}': {str(e)}"
        )


@router.get("/payments/{payment_id}", response_model=Dict[str, Any])
def get_razorpay_payment(payment_id: str):
    """Retrieve a specific payment transaction from Razorpay TEST MODE."""
    try:
        data = RazorpayService.get_payment(payment_id)
        return data
    except ValueError as e:
        err_str = str(e)
        if "not found" in err_str.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=err_str)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_str)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve Razorpay payment '{payment_id}': {str(e)}"
        )
