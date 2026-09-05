from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from backend.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(64), primary_key=True, index=True)
    merchant_id = Column(String(64), index=True, default="merchant_sports")
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    phone = Column(String(32), nullable=True)
    location = Column(String(128), nullable=True)
    status = Column(String(32), default="active")  # active, high_intent, at_risk, lapsed
    lifetime_value = Column(Float, default=0.0)
    avatar_color = Column(String(16), default="#111111")
    current_intent = Column(String(64), default="HIGH_PURCHASE_INTENT")
    next_best_action = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    activities = relationship("CustomerActivity", back_populates="customer", cascade="all, delete-orphan")
    cart = relationship("Cart", back_populates="customer", uselist=False, cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(String(64), primary_key=True, index=True)
    merchant_id = Column(String(64), index=True, default="merchant_sports")
    name = Column(String(255), nullable=False, index=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    currency = Column(String(8), default="INR")
    availability = Column(Boolean, default=True)
    stock_count = Column(Integer, default=50)
    category = Column(String(128), nullable=False, index=True)
    subcategory = Column(String(128), nullable=True)
    description = Column(Text, nullable=True)
    margin = Column(Float, default=45.0)
    status = Column(String(32), default="Active")  # Active, Archived, Draft
    image = Column(String(512), nullable=True)
    ai_summary = Column(Text, nullable=True)
    features = Column(Text, default="[]")  # JSON list
    ai_buyer_tags = Column(Text, default="[]")  # JSON list
    suitable_for = Column(Text, default="[]")  # JSON list
    cross_sell_affinity = Column(Text, default="[]")  # JSON list of affinity dicts
    price_elasticity_score = Column(Float, default=0.8)
    purchase_eligibility = Column(String(255), default="Instant checkout ready in Razorpay Test Mode.")
    json_ld_schema = Column(Text, default="{}")  # JSON object
    created_at = Column(DateTime, default=utc_now)

    def get_features_list(self):
        try:
            return json.loads(self.features) if self.features else []
        except Exception:
            return []

    def get_buyer_tags_list(self):
        try:
            return json.loads(self.ai_buyer_tags) if self.ai_buyer_tags else []
        except Exception:
            return []

    def get_suitable_for_list(self):
        try:
            return json.loads(self.suitable_for) if self.suitable_for else []
        except Exception:
            return []

    def get_cross_sell_affinity_list(self):
        try:
            return json.loads(self.cross_sell_affinity) if self.cross_sell_affinity else []
        except Exception:
            return []


class CustomerActivity(Base):
    __tablename__ = "customer_activity"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String(64), ForeignKey("customers.id"), nullable=False, index=True)
    merchant_id = Column(String(64), default="merchant_sports", index=True)
    event_type = Column(String(64), nullable=False, index=True)  # PRODUCT_VIEW, PRODUCT_SEARCH, ADD_TO_CART, REMOVE_FROM_CART, CHECKOUT_STARTED, PURCHASE_COMPLETED, AI_RECOMMENDATION_SHOWN, AI_RECOMMENDATION_ACCEPTED
    product_id = Column(String(64), nullable=True, index=True)
    product_name = Column(String(255), nullable=True)
    amount = Column(Float, default=0.0)
    activity_metadata = Column("metadata", Text, default="{}")  # JSON payload
    timestamp = Column(DateTime, default=utc_now, index=True)

    customer = relationship("Customer", back_populates="activities")

    def get_metadata(self):
        try:
            return json.loads(self.activity_metadata) if self.activity_metadata else {}
        except Exception:
            return {}


class Cart(Base):
    __tablename__ = "carts"

    id = Column(String(64), primary_key=True, index=True)
    customer_id = Column(String(64), ForeignKey("customers.id"), unique=True, nullable=False, index=True)
    merchant_id = Column(String(64), default="merchant_sports", index=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    customer = relationship("Customer", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cart_id = Column(String(64), ForeignKey("carts.id"), nullable=False, index=True)
    product_id = Column(String(64), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=False)
    is_ai_recommended = Column(Boolean, default=False)
    added_at = Column(DateTime, default=utc_now)

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(64), primary_key=True, index=True)
    customer_id = Column(String(64), ForeignKey("customers.id"), nullable=False, index=True)
    customer_name = Column(String(128), nullable=False)
    merchant_id = Column(String(64), default="merchant_sports", index=True)
    razorpay_order_id = Column(String(64), unique=True, index=True, nullable=False)
    razorpay_payment_id = Column(String(64), nullable=True)
    base_product = Column(String(255), nullable=False)
    base_amount = Column(Float, nullable=False)
    ai_addon_product = Column(String(255), nullable=True)
    ai_addon_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    status = Column(String(32), default="SUCCESS")  # SUCCESS, PENDING, FAILED, REFUNDED
    payment_method = Column(String(32), default="UPI")  # UPI, Card, Netbanking
    ai_attribution = Column(String(64), default="Direct")  # Direct, AI Cross-sell, AI Upsell
    ai_attributed_revenue = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utc_now, index=True)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(64), ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(String(64), ForeignKey("products.id"), nullable=False)
    product_name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    is_addon = Column(Boolean, default=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(64), primary_key=True, index=True)
    order_id = Column(String(64), ForeignKey("orders.id"), nullable=False, index=True)
    razorpay_order_id = Column(String(64), nullable=False, index=True)
    razorpay_payment_id = Column(String(64), nullable=False, index=True)
    razorpay_signature = Column(String(128), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="INR")
    status = Column(String(32), default="CAPTURED")  # CAPTURED, FAILED, CREATED
    payment_method = Column(String(32), default="UPI")
    created_at = Column(DateTime, default=utc_now)

    order = relationship("Order", back_populates="payment")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String(64), ForeignKey("customers.id"), nullable=True, index=True)
    product_id = Column(String(64), ForeignKey("products.id"), nullable=False)
    reference_product_id = Column(String(64), nullable=True)
    recommendation_type = Column(String(32), nullable=False)  # cross_sell, upsell, activity_based, frequently_paired
    headline = Column(String(128), default="Complete Your Setup")
    reason = Column(Text, nullable=False)
    score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    factors = Column(Text, default="[]")  # JSON list
    created_at = Column(DateTime, default=utc_now)

    product = relationship("Product")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(64), primary_key=True, index=True)
    merchant_id = Column(String(64), default="merchant_sports", index=True)
    agent = Column(String(32), default="COMMERCE")
    stage = Column(String(32), default="ACTION")
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    tool_used = Column(String(64), default="StorefrontAPI")
    customer_id = Column(String(64), nullable=True)
    customer_name = Column(String(128), nullable=True)
    status = Column(String(32), default="success")  # success, warning, info, pending
    signature_hash = Column(String(128), nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)
