from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import DashboardResponse
from services.adaptive import adaptive_engine

router = APIRouter()

@router.get("/dashboard/{user_id}", response_model=DashboardResponse)
def get_student_dashboard(user_id: int = 1, db: Session = Depends(get_db)):
    data = adaptive_engine.get_dashboard_data(db, user_id)
    return DashboardResponse(**data)
