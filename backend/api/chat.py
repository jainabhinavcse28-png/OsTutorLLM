from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import ChatHistory
from schemas import ChatRequest, ChatResponse, SourceCitation
from services.rag import rag_engine
from services.llm import llm_service

router = APIRouter()

@router.post("/chat/ask", response_model=ChatResponse)
def ask_os_question(request: ChatRequest, db: Session = Depends(get_db)):
    # 1. Retrieve relevant chunks
    chunks = rag_engine.search(request.question, top_k=3)

    # 2. Synthesize answer with LLM / grounded pedagogical engine
    answer = llm_service.generate_rag_answer(request.question, chunks)

    # 3. Format sources
    sources = [
        SourceCitation(
            document=c["document"],
            module=c["module"],
            section=c["section"],
            snippet=c["snippet"]
        )
        for c in chunks
    ]

    # 4. Save to chat_history
    try:
        chat_record = ChatHistory(
            user_id=request.user_id,
            question=request.question,
            answer=answer,
            sources=[s.dict() for s in sources]
        )
        db.add(chat_record)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error saving chat history: {e}")

    inferred_topic = chunks[0]["module"] if chunks else "Operating Systems"

    return ChatResponse(
        answer=answer,
        sources=sources,
        topic=inferred_topic
    )

@router.get("/chat/history")
def get_chat_history(user_id: int = 1, db: Session = Depends(get_db)):
    records = db.query(ChatHistory).filter(ChatHistory.user_id == user_id).order_by(ChatHistory.id.desc()).limit(20).all()
    return [
        {
            "id": r.id,
            "question": r.question,
            "answer": r.answer,
            "sources": r.sources,
            "created_at": r.created_at
        }
        for r in records
    ]
