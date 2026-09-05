from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# ---------------------------------------------------------------------------
# Health Schema
# ---------------------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "MerchantOS Backend"
    database: str = "connected"


# ---------------------------------------------------------------------------
# Product Schemas
# ---------------------------------------------------------------------------
class CrossSellAffinityItem(BaseModel):
    productId: str
    productName: str
    affinityScore: float
    price: float
    reason: str


class ProductBase(BaseModel):
    id: str
    merchantId: Optional[str] = "merchant_sports"
    name: str
    price: float
    originalPrice: Optional[float] = None
    currency: str = "INR"
    availability: bool = True
    stockCount: int = 50
    category: str
    subcategory: Optional[str] = None
    description: Optional[str] = None
    margin: Optional[float] = 45.0
    status: Optional[str] = "Active"
    image: Optional[str] = None
    aiSummary: Optional[str] = None
    features: List[str] = []
    aiBuyerTags: List[str] = []
    suitableFor: List[str] = []
    crossSellAffinity: List[CrossSellAffinityItem] = []
    priceElasticityScore: Optional[float] = 0.8
    purchaseEligibility: Optional[str] = "Instant checkout ready in Razorpay Test Mode."
    jsonLdSchema: Optional[Dict[str, Any]] = None


class ProductResponse(ProductBase):
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Customer Activity Schemas
# ---------------------------------------------------------------------------
class ActivityCreateRequest(BaseModel):
    customerId: Optional[str] = None
    customerName: Optional[str] = None
    merchantId: Optional[str] = "merchant_sports"
    eventType: str  # PRODUCT_VIEW, PRODUCT_SEARCH, ADD_TO_CART, REMOVE_FROM_CART, CHECKOUT_STARTED, PURCHASE_COMPLETED, AI_RECOMMENDATION_SHOWN, AI_RECOMMENDATION_ACCEPTED
    productId: Optional[str] = None
    productName: Optional[str] = None
    amount: Optional[float] = 0.0
    source: Optional[str] = "STOREFRONT"
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ActivityResponse(BaseModel):
    id: int
    customerId: str
    merchantId: str
    eventType: str
    productId: Optional[str] = None
    productName: Optional[str] = None
    amount: float
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Customer Schemas
# ---------------------------------------------------------------------------
class CustomerBehaviorSchema(BaseModel):
    viewedTimes: int = 0
    lastViewedProduct: Optional[str] = None
    cartValue: float = 0.0
    cartItems: List[str] = []
    daysActive: int = 1
    hasPurchased: bool = False
    intentScore: int = 75
    preferredCategories: List[str] = []
    viewedProducts: List[str] = []
    searchQueries: List[str] = []


class CustomerMetricsSchema(BaseModel):
    totalOrders: int = 0
    totalSpend: float = 0.0
    averageOrderValue: float = 0.0
    lastPurchaseAt: Optional[str] = None


class CustomerResponse(BaseModel):
    id: str
    merchantId: str
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    status: str
    lifetimeValue: float
    avatarColor: str
    currentIntent: Optional[str] = None
    nextBestAction: Optional[str] = None
    behavior: Optional[CustomerBehaviorSchema] = None
    metrics: Optional[CustomerMetricsSchema] = None
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Cart Schemas
# ---------------------------------------------------------------------------
class CartItemAddRequest(BaseModel):
    customerId: str
    productId: str
    quantity: int = 1
    isAiRecommended: bool = False
    merchantId: Optional[str] = "merchant_sports"


class CartItemRemoveRequest(BaseModel):
    customerId: str
    productId: str


class CartClearRequest(BaseModel):
    customerId: str


class CartItemResponse(BaseModel):
    productId: str
    productName: str
    price: float
    quantity: int
    isAiRecommended: bool
    image: Optional[str] = None
    category: Optional[str] = None


class CartResponse(BaseModel):
    customerId: str
    merchantId: str
    items: List[CartItemResponse] = []
    totalItems: int = 0
    subtotal: float = 0.0
    updatedAt: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Recommendation Schemas
# ---------------------------------------------------------------------------
class RecommendationRequest(BaseModel):
    customerId: Optional[str] = None
    merchantId: Optional[str] = "merchant_sports"
    referenceProductId: Optional[str] = None
    cartProductIds: Optional[List[str]] = Field(default_factory=list)
    searchQuery: Optional[str] = None
    maxResults: Optional[int] = 3


class RecommendationItemSchema(BaseModel):
    product_id: str
    product: ProductResponse
    recommendation_type: str  # "cross_sell" or "upsell"
    headline: str
    reason: str
    confidence: float
    score: float
    contributing_factors: List[str] = []


class RecommendationResponse(BaseModel):
    has_strong_recommendation: bool
    message: str
    headline: str
    recommendations: List[RecommendationItemSchema] = []
    primary_recommendation: Optional[RecommendationItemSchema] = None
    context_summary: str


# ---------------------------------------------------------------------------
# Order Schemas
# ---------------------------------------------------------------------------
class OrderCreateRequest(BaseModel):
    customerId: str
    customerName: Optional[str] = None
    merchantId: Optional[str] = "merchant_sports"
    baseProductId: str
    aiAddonProductId: Optional[str] = None
    paymentMethod: Optional[str] = "UPI"


class OrderItemSchema(BaseModel):
    productId: str
    productName: str
    price: float
    quantity: int
    isAddon: bool


class OrderResponse(BaseModel):
    id: str
    customerId: str
    customerName: str
    merchantId: str
    razorpayOrderId: str
    razorpayPaymentId: Optional[str] = None
    baseProduct: str
    baseAmount: float
    aiAddonProduct: Optional[str] = None
    aiAddonAmount: float = 0.0
    totalAmount: float
    status: str
    paymentMethod: str
    aiAttribution: str
    aiAttributedRevenue: float
    createdAt: datetime
    items: List[OrderItemSchema] = []

    class Config:
        from_attributes = True

class CustomerOrderItem(BaseModel):
    order_id: str
    booking_id: str
    date: str
    formatted_date: Optional[str] = None
    amount: float
    payment_status: str
    payment_method: str
    status: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    merchant_id: Optional[str] = None
    base_product: Optional[str] = None
    ai_addon_product: Optional[str] = None
    ai_attribution: Optional[str] = None
    ai_attributed_revenue: Optional[float] = 0.0
    items: Optional[List[OrderItemSchema]] = []


class CustomerOrdersResponse(BaseModel):
    customer_id: str
    order_count: int
    orders: List[CustomerOrderItem] = []


# ---------------------------------------------------------------------------
# Payment Schemas (Razorpay Test Mode)
# ---------------------------------------------------------------------------
class RazorpayOrderCreateRequest(BaseModel):
    customerId: str
    amount: float
    currency: str = "INR"
    baseProductId: str
    aiAddonProductId: Optional[str] = None
    merchantId: Optional[str] = "merchant_sports"


class RazorpayOrderResponse(BaseModel):
    razorpayOrderId: str
    amount: float
    currency: str
    status: str = "created"
    keyId: str = "rzp_test_sports_9921"
    customerName: str
    baseProduct: str
    addonProduct: Optional[str] = None


class RazorpayVerifyRequest(BaseModel):
    razorpayOrderId: str
    razorpayPaymentId: str
    razorpaySignature: Optional[str] = None
    customerId: str
    paymentMethod: Optional[str] = "UPI"
    baseProductId: str
    aiAddonProductId: Optional[str] = None
    merchantId: Optional[str] = "merchant_sports"


class RazorpayVerifyResponse(BaseModel):
    verified: bool
    status: str = "SUCCESS"
    orderId: str
    razorpayOrderId: str
    razorpayPaymentId: str
    totalAmount: float
    message: str = "Razorpay Test Mode payment verified successfully."


# ---------------------------------------------------------------------------
# Admin Schemas
# ---------------------------------------------------------------------------
class AdminActivityItemSchema(BaseModel):
    id: str
    merchantId: str
    timestamp: str
    agent: str
    stage: str
    title: str
    description: str
    toolUsed: str
    customerName: Optional[str] = None
    status: str


# ---------------------------------------------------------------------------
# Razorpay REST API Direct Integration Schemas
# ---------------------------------------------------------------------------
class RazorpayHealthResponse(BaseModel):
    status: str = "ok"
    configured: bool = True
    mode: str = "test"


class RazorpayDirectOrderCreateRequest(BaseModel):
    amount: float = Field(..., description="Amount in INR, e.g. 100, 6999 or 6999.0")
    currency: Optional[str] = "INR"
    receipt: Optional[str] = None
    customer_id: Optional[str] = None
    merchant_order_id: Optional[str] = None
    case_id: Optional[str] = None
    customerId: Optional[str] = None
    merchantOrderId: Optional[str] = None
    caseId: Optional[str] = None
    notes: Optional[Dict[str, Any]] = Field(default_factory=dict)


class RazorpayDirectOrderResponse(BaseModel):
    success: bool = True
    razorpay_order_id: str
    amount: int  # in paise
    currency: str = "INR"
    status: str = "created"
    receipt: Optional[str] = None
    notes: Optional[Any] = None


class RazorpayDirectOrderInfo(BaseModel):
    id: str
    entity: str = "order"
    amount: int
    amount_paid: int = 0
    amount_due: int = 0
    currency: str = "INR"
    receipt: Optional[str] = None
    status: str
    attempts: int = 0
    notes: Optional[Any] = None
    created_at: Optional[int] = None


class RazorpayPaymentsListResponse(BaseModel):
    entity: str = "collection"
    count: int = 0
    items: List[Dict[str, Any]] = []
