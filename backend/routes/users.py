from fastapi import APIRouter
from sqlalchemy import insert
from database import engine
from models import User
from schemas import UserCreate

router = APIRouter()


@router.post("/users")
def create_user(user: UserCreate):
    query = insert(User).values(
        name=user.name,
        email=user.email
    )

    with engine.begin() as connection:
        result = connection.execute(query)
        user_id = result.inserted_primary_key[0]

    return {
        "id": user_id,
        "name": user.name,
        "email": user.email
    }


@router.get("/users")
def get_users():
    with engine.connect() as connection:
        result = connection.execute(User.__table__.select())
        users = result.mappings().all()

    return [dict(user) for user in users]