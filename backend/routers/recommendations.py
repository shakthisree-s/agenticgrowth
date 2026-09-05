from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import schemas
from backend.services.recommendation_service import RecommendationService

router = APIRouter(
    prefix="/api/recommendations",
    tags=["Recommendations"]
)


@router.post("", response_model=schemas.RecommendationResponse)
@router.post("/", response_model=schemas.RecommendationResponse, include_in_schema=False)
def get_recommendations(request: schemas.RecommendationRequest, db: Session = Depends(get_db)):
    """
    Contextual Upsell and Cross-Sell AI Recommendation Engine.
    Uses multi-factor scoring (catalog affinity, complementary relationships, customer activity, search history, price compatibility).
    """
    return RecommendationService.generate_recommendations(db, request)
