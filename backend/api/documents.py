from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Document

router = APIRouter()

@router.get("/documents")
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(Document).all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "title": d.title,
            "topic": d.topic,
            "module": d.module,
            "content": d.content,
            "file_type": d.file_type
        }
        for d in docs
    ]
