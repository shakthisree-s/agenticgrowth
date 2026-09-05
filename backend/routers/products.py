from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas

router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)


@router.get("", response_model=List[schemas.ProductResponse])
@router.get("/", response_model=List[schemas.ProductResponse], include_in_schema=False)
def list_products(
    merchant_id: Optional[str] = Query(None, description="Filter by merchant (e.g. merchant_sports)"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    search: Optional[str] = Query(None, description="Search query string"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Product).filter(
        models.Product.status == "Active",
        models.Product.availability == True
    )

    if merchant_id:
        query = query.filter(models.Product.merchant_id == merchant_id)
    if category:
        query = query.filter(models.Product.category.ilike(f"%{category}%"))

    products = query.all()

    if search:
        s_lower = search.lower()
        products = [
            p for p in products
            if s_lower in p.name.lower()
            or s_lower in p.category.lower()
            or s_lower in (p.subcategory or "").lower()
            or any(s_lower in tag.lower() for tag in p.get_buyer_tags_list())
        ]

    return [
        schemas.ProductResponse(
            id=p.id,
            merchantId=p.merchant_id,
            name=p.name,
            price=p.price,
            originalPrice=p.original_price,
            currency=p.currency,
            availability=p.availability,
            stockCount=p.stock_count,
            category=p.category,
            subcategory=p.subcategory,
            description=p.description,
            margin=p.margin,
            status=p.status,
            image=p.image,
            aiSummary=p.ai_summary,
            features=p.get_features_list(),
            aiBuyerTags=p.get_buyer_tags_list(),
            suitableFor=p.get_suitable_for_list(),
            crossSellAffinity=[
                schemas.CrossSellAffinityItem(**a) for a in p.get_cross_sell_affinity_list()
            ],
            priceElasticityScore=p.price_elasticity_score,
            purchaseEligibility=p.purchase_eligibility,
            createdAt=p.created_at
        )
        for p in products
    ]


@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    p = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")

    return schemas.ProductResponse(
        id=p.id,
        merchantId=p.merchant_id,
        name=p.name,
        price=p.price,
        originalPrice=p.original_price,
        currency=p.currency,
        availability=p.availability,
        stockCount=p.stock_count,
        category=p.category,
        subcategory=p.subcategory,
        description=p.description,
        margin=p.margin,
        status=p.status,
        image=p.image,
        aiSummary=p.ai_summary,
        features=p.get_features_list(),
        aiBuyerTags=p.get_buyer_tags_list(),
        suitableFor=p.get_suitable_for_list(),
        crossSellAffinity=[
            schemas.CrossSellAffinityItem(**a) for a in p.get_cross_sell_affinity_list()
        ],
        priceElasticityScore=p.price_elasticity_score,
        purchaseEligibility=p.purchase_eligibility,
        createdAt=p.created_at
    )
