from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from backend import models, schemas

# Complementary domain relationships: (category_a, category_b, affinity_score, reason)
COMPLEMENTARY_CATEGORY_PAIRS = [
    # Sports Domain
    ("running shoes", "socks", 0.40, "Anti-blister compression socks prevent friction during daily runs."),
    ("running shoes", "shoe care", 0.35, "Eco-friendly foaming cleaner keeps running knit & mesh fresh."),
    ("running shoes", "hydration", 0.32, "Stay hydrated during your high-mileage running sessions."),
    ("running shoes", "accessories & apparel", 0.30, "Essential running accessories for your training kit."),
    ("running shoes", "recovery gear", 0.32, "Post-run myofascial release and muscle recovery gear."),
    ("running shoes", "headwear", 0.28, "Sun protection running cap for outdoor sessions."),
    ("hydration", "nutrition", 0.38, "Fast-dissolving electrolyte hydration powder mix for your flask."),
    ("hydration", "fitness accessories", 0.35, "Quick-dry sweat towel to complete your workout setup."),
    ("hydration", "socks", 0.28, "Essential athletic accessories for daily training."),
    ("hydration", "accessories & apparel", 0.30, "Pairs with your hydration and fitness setup."),
    ("apparel", "accessories & apparel", 0.32, "Matching headwear and accessories for athletic apparel."),
    ("t-shirts", "shorts", 0.42, "Matching technical lightweight running shorts."),
    ("shorts", "t-shirts", 0.42, "Matching moisture-wicking technical running t-shirt."),

    # Fashion Domain
    ("kurtis", "dupattas", 0.45, "Matching coordinated lightweight dupatta to complete your ethnic ensemble."),
    ("kurtis", "bottom wear", 0.40, "Matching wide-leg pure cotton palazzo pants."),
    ("kurtis", "palazzos", 0.40, "Coordinating relaxed-fit cotton palazzo pants."),
    ("ethnic wear", "dupattas", 0.40, "Matching festive dupatta styling."),
    ("ethnic wear", "bottom wear", 0.38, "Pairs with your ethnic top for a complete outfit."),

    # Tech Domain
    ("laptop stands", "peripherals", 0.42, "Ergonomic dual-mode silent mouse for elevated laptop typing."),
    ("laptop stands", "docking & hubs", 0.40, "Multi-port USB-C docking hub for your dual-display setup."),
    ("workstation accessories", "peripherals", 0.38, "Ergonomic wireless mouse for your desk setup."),
    ("phone cases", "screen protectors", 0.48, "Complete 360° drop and shatterproof screen protection bundle."),
    ("tech accessories", "screen protectors", 0.45, "Tempered glass protection for your phone case.")
]


class RecommendationService:
    @staticmethod
    def get_customer_history(db: Session, customer_id: Optional[str]) -> Dict[str, Any]:
        """Gathers customer viewing, search, and purchase context from SQLite."""
        if not customer_id:
            return {
                "viewed_product_ids": set(),
                "viewed_product_names": set(),
                "search_queries": [],
                "purchased_product_ids": set(),
                "preferred_categories": set(),
            }

        # 1. Activities
        activities = (
            db.query(models.CustomerActivity)
            .filter(models.CustomerActivity.customer_id == customer_id)
            .order_by(models.CustomerActivity.timestamp.desc())
            .limit(50)
            .all()
        )

        viewed_ids = set()
        viewed_names = set()
        searches = []
        purchased_ids = set()
        preferred_cats = set()

        for act in activities:
            if act.event_type in ("PRODUCT_VIEW", "PRODUCT_VIEWED"):
                if act.product_id:
                    viewed_ids.add(act.product_id)
                if act.product_name:
                    viewed_names.add(act.product_name.lower())
            elif act.event_type in ("PRODUCT_SEARCH", "SEARCH_PERFORMED"):
                meta = act.get_metadata()
                if "query" in meta:
                    searches.append(meta["query"].lower())
            elif act.event_type in ("PURCHASE_COMPLETED", "PAYMENT_SUCCESS"):
                if act.product_id:
                    purchased_ids.add(act.product_id)

        # 2. Orders & Order Items
        orders = (
            db.query(models.Order)
            .filter(models.Order.customer_id == customer_id, models.Order.status == "SUCCESS")
            .all()
        )
        for ord_obj in orders:
            for item in ord_obj.items:
                purchased_ids.add(item.product_id)

        # 3. Customer Profile preferred categories
        cust = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
        if cust and cust.activities:
            for act in cust.activities:
                if act.product_id:
                    prod = db.query(models.Product).filter(models.Product.id == act.product_id).first()
                    if prod:
                        preferred_cats.add(prod.category.lower())

        return {
            "viewed_product_ids": viewed_ids,
            "viewed_product_names": viewed_names,
            "search_queries": searches,
            "purchased_product_ids": purchased_ids,
            "preferred_categories": preferred_cats,
        }

    @classmethod
    def score_candidate(
        cls,
        candidate: models.Product,
        reference_product: Optional[models.Product],
        cart_product_ids: List[str],
        customer_history: Dict[str, Any],
        search_query: Optional[str] = None
    ) -> Tuple[float, str, str, str, float, List[str]]:
        """
        Calculates mathematical recommendation score for a candidate product.
        Returns: (score, recommendation_type, headline, reason, confidence, contributing_factors)
        """
        score = 0.0
        factors = []
        rec_type = "cross_sell"
        reason = f"Recommended addition for your session."
        headline = "Complete Your Setup"

        cand_cat = f"{candidate.category} {candidate.subcategory or ''}".lower()
        cand_name = candidate.name.lower()
        cand_text = f"{candidate.name} {candidate.category} {candidate.subcategory or ''} {' '.join(candidate.get_buyer_tags_list())} {' '.join(candidate.get_features_list())} {' '.join(candidate.get_suitable_for_list())}".lower()

        # 1. Direct Explicit Catalog Affinity (Highest Accuracy Signal)
        if reference_product:
            affinities = reference_product.get_cross_sell_affinity_list()
            for aff in affinities:
                if aff.get("productId") == candidate.id:
                    aff_score = float(aff.get("affinityScore", 0.85))
                    score += aff_score * 0.45
                    factors.append(f"Catalog Cross-Sell Affinity ({int(aff_score * 100)}%)")
                    reason = aff.get("reason", f"Frequently paired with {reference_product.name}.")
                    rec_type = "cross_sell"
                    break

        # 2. Complementary Category Pairs
        if reference_product:
            ref_cat = f"{reference_product.category} {reference_product.subcategory or ''}".lower()
            for cat_a, cat_b, pair_weight, pair_reason in COMPLEMENTARY_CATEGORY_PAIRS:
                if (cat_a in ref_cat and cat_b in cand_cat) or (cat_b in ref_cat and cat_a in cand_cat):
                    score += pair_weight
                    factors.append(f"Complementary Pair ({cat_a} ↔ {cat_b})")
                    if "Catalog" not in "".join(factors):
                        reason = pair_reason
                        rec_type = "cross_sell"
                    break

            # 3. UPSELL: Same category, higher price (+10% to +80%), superior features
            is_same_category = reference_product.category.lower() == candidate.category.lower()
            is_higher_price = reference_product.price * 1.08 <= candidate.price <= reference_product.price * 1.85
            if is_same_category and is_higher_price:
                score += 0.38
                factors.append(f"Premium Upgrade Option (+₹{int(candidate.price - reference_product.price):,})")
                reason = f"Premium upgrade from {reference_product.name} with advanced performance materials."
                rec_type = "upsell"
                headline = "Upgrade Option"

        # 4. Direct Search Query Match (High relevance when user explicitly searches)
        if search_query:
            sq_tokens = [t for t in search_query.lower().split() if len(t) > 2]
            sq_hits = sum(1 for t in sq_tokens if t in cand_text)
            if sq_hits > 0:
                score += min(0.55, sq_hits * 0.18)
                factors.append(f"Direct Search Intent Match ({sq_hits} tokens)")
                reason = f"Matches your search for '{search_query}'."

        # 5. Customer Activity & Past Search Personalization Match
        all_searches = list(customer_history.get("search_queries", []))
        query_hits = 0
        for q in all_searches[-5:]:
            tokens = [t for t in q.split() if len(t) > 2]
            for t in tokens:
                if t in cand_text:
                    query_hits += 1

        if query_hits > 0:
            act_bonus = min(0.35, query_hits * 0.10)
            score += act_bonus
            factors.append(f"Customer Activity Match ({query_hits} terms)")
            if rec_type == "cross_sell" and "Catalog" not in "".join(factors) and not search_query:
                reason = f"Matches your interest in {all_searches[-1]}."

        # 6. Customer Viewed Products History
        if candidate.id in customer_history.get("viewed_product_ids", set()):
            score += 0.22
            factors.append("Recently Viewed Product")

        # 7. Customer Preferred Category Match
        if candidate.category.lower() in customer_history.get("preferred_categories", set()):
            score += 0.18
            factors.append(f"Preferred Category ({candidate.category})")

        # 7. Price Fit Optimization (Ideal add-on bundle ratio: 8% to 60% of base item)
        if reference_product and rec_type == "cross_sell":
            price_ratio = candidate.price / max(reference_product.price, 1.0)
            if 0.06 <= price_ratio <= 0.65:
                score += 0.14
                factors.append(f"Ideal Add-on Price Fit ({int(price_ratio * 100)}%)")

        # 8. Shared Tags Match
        if reference_product:
            ref_tags = set(t.lower() for t in reference_product.get_buyer_tags_list() + reference_product.get_suitable_for_list())
            cand_tags = set(t.lower() for t in candidate.get_buyer_tags_list() + candidate.get_suitable_for_list())
            shared = ref_tags.intersection(cand_tags)
            if shared:
                tag_bonus = min(0.20, len(shared) * 0.06)
                score += tag_bonus
                factors.append(f"Shared Attributes ({', '.join(list(shared)[:2])})")

        # Calculate confidence bounded between 0.50 and 0.98
        confidence = round(min(0.98, max(0.50, score)), 2)
        score = round(score, 2)

        return score, rec_type, headline, reason, confidence, factors

    @classmethod
    def generate_recommendations(
        cls,
        db: Session,
        request: schemas.RecommendationRequest
    ) -> schemas.RecommendationResponse:
        """
        Main recommendation engine endpoint execution.
        """
        merchant_id = request.merchantId or "merchant_sports"
        customer_history = cls.get_customer_history(db, request.customerId)

        # Retrieve reference product if provided
        reference_product: Optional[models.Product] = None
        if request.referenceProductId:
            reference_product = (
                db.query(models.Product)
                .filter(models.Product.id == request.referenceProductId)
                .first()
            )

        # Identify excluded product IDs:
        # - Currently added / reference product
        # - Items already in cart
        # - Items already purchased
        excluded_ids = set(request.cartProductIds or [])
        if reference_product:
            excluded_ids.add(reference_product.id)
        for pid in customer_history.get("purchased_product_ids", set()):
            excluded_ids.add(pid)

        # Retrieve candidate pool for the active merchant
        candidates_query = db.query(models.Product).filter(
            models.Product.merchant_id == merchant_id,
            models.Product.status == "Active",
            models.Product.availability == True,
            models.Product.stock_count > 0
        )

        candidates = [p for p in candidates_query.all() if p.id not in excluded_ids]

        if not candidates:
            return schemas.RecommendationResponse(
                has_strong_recommendation=False,
                message="No strong complementary recommendation right now.",
                headline="Recommendations",
                recommendations=[],
                context_summary="No available candidates after applying exclusions."
            )

        # Score all candidate products
        scored_items: List[schemas.RecommendationItemSchema] = []
        for cand in candidates:
            score, rec_type, headline, reason, confidence, factors = cls.score_candidate(
                candidate=cand,
                reference_product=reference_product,
                cart_product_ids=request.cartProductIds or [],
                customer_history=customer_history,
                search_query=request.searchQuery
            )

            # Minimum threshold for strong recommendation
            if score >= 0.25:
                # Convert Product ORM to ProductResponse Schema
                product_schema = schemas.ProductResponse(
                    id=cand.id,
                    merchantId=cand.merchant_id,
                    name=cand.name,
                    price=cand.price,
                    originalPrice=cand.original_price,
                    currency=cand.currency,
                    availability=cand.availability,
                    stockCount=cand.stock_count,
                    category=cand.category,
                    subcategory=cand.subcategory,
                    description=cand.description,
                    margin=cand.margin,
                    status=cand.status,
                    image=cand.image,
                    aiSummary=cand.ai_summary,
                    features=cand.get_features_list(),
                    aiBuyerTags=cand.get_buyer_tags_list(),
                    suitableFor=cand.get_suitable_for_list(),
                    crossSellAffinity=[
                        schemas.CrossSellAffinityItem(**a) for a in cand.get_cross_sell_affinity_list()
                    ],
                    priceElasticityScore=cand.price_elasticity_score,
                    purchaseEligibility=cand.purchase_eligibility,
                    createdAt=cand.created_at
                )

                item = schemas.RecommendationItemSchema(
                    product_id=cand.id,
                    product=product_schema,
                    recommendation_type=rec_type,
                    headline=headline,
                    reason=reason,
                    confidence=confidence,
                    score=score,
                    contributing_factors=factors
                )
                scored_items.append(item)

        # Sort by score descending
        scored_items.sort(key=lambda x: x.score, reverse=True)
        max_res = request.maxResults or 3
        top_recommendations = scored_items[:max_res]

        if not top_recommendations:
            return schemas.RecommendationResponse(
                has_strong_recommendation=False,
                message="No strong complementary recommendation right now.",
                headline="Recommendations",
                recommendations=[],
                context_summary="No candidates met the minimum relevance threshold."
            )

        primary = top_recommendations[0]
        headline = primary.headline

        if primary.recommendation_type == "upsell":
            msg = f"Upgrade Option: {primary.product.name} (+₹{int(primary.product.price - (reference_product.price if reference_product else 0)):,})"
        elif len(top_recommendations) > 1 and reference_product:
            msg = f"Complete your {reference_product.category.lower()} setup with these complementary items:"
        elif reference_product:
            msg = f"Since you selected {reference_product.name}, you may also like:"
        else:
            msg = "Recommended for you based on your activity:"

        # Record recommendation in database
        try:
            for rec in top_recommendations:
                rec_db = models.Recommendation(
                    customer_id=request.customerId,
                    product_id=rec.product_id,
                    reference_product_id=request.referenceProductId,
                    recommendation_type=rec.recommendation_type,
                    headline=rec.headline,
                    reason=rec.reason,
                    score=rec.score,
                    confidence=rec.confidence,
                    factors=str(rec.contributing_factors)
                )
                db.add(rec_db)
            db.commit()
        except Exception:
            db.rollback()

        return schemas.RecommendationResponse(
            has_strong_recommendation=True,
            message=msg,
            headline=headline,
            recommendations=top_recommendations,
            primary_recommendation=primary,
            context_summary=f"Generated {len(top_recommendations)} personalized recommendations using customer activity & catalog graph."
        )
