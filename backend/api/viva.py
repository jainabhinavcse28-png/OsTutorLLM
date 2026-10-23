from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import VivaSession
from schemas import (
    VivaStartRequest, VivaStartResponse,
    VivaRespondRequest, VivaEvaluationResponse
)
from services.llm import llm_service

router = APIRouter()

TOPIC_INITIAL_QUESTIONS = {
    "Process Management & CPU Scheduling": "Welcome to your OS Viva Voce. Let's begin: Explain the fundamental architectural difference between a process and a thread.",
    "CPU Scheduling": "Explain the fundamental architectural difference between a process and a thread, and why context switching between threads is faster.",
    "Process Synchronization": "Explain the Critical Section problem and detail the three conditions required for any valid synchronization solution.",
    "Deadlocks": "What is a Deadlock? Enumerate and explain the four Coffman conditions necessary for a deadlock to occur.",
    "Memory Management": "Explain the difference between logical and physical address spaces, and how paging eliminates external fragmentation.",
    "File Systems & I/O": "Compare contiguous allocation with indexed file allocation in modern file systems."
}

@router.post("/viva/start", response_model=VivaStartResponse)
def start_viva(req: VivaStartRequest, db: Session = Depends(get_db)):
    topic = req.topic
    initial_q = TOPIC_INITIAL_QUESTIONS.get(
        topic,
        f"Explain the core operating system mechanisms and design trade-offs behind {topic}."
    )

    # Create session record
    session = VivaSession(
        user_id=req.user_id,
        topic=topic,
        score=0.0,
        conversation=[{"speaker": "examiner", "message": initial_q}],
        feedback={}
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return VivaStartResponse(
        session_id=session.id,
        topic=topic,
        initial_question=initial_q,
        instruction="Answer thoroughly as if in an oral examination. The examiner will evaluate your technical precision, check for missing points, and ask targeted follow-up questions."
    )

@router.post("/viva/respond", response_model=VivaEvaluationResponse)
def respond_viva(req: VivaRespondRequest, db: Session = Depends(get_db)):
    # Find last question asked
    last_q = "Explain the operating systems concept."
    for turn in reversed(req.conversation_history):
        if turn.speaker == "examiner":
            last_q = turn.message
            break

    # Convert conversation history
    history_dicts = [t.dict() for t in req.conversation_history]

    # Evaluate using AI Examiner
    evaluation = llm_service.evaluate_viva(
        topic=req.topic,
        question=last_q,
        student_answer=req.student_answer,
        history=history_dicts
    )

    # Save to session if session_id provided
    if req.session_id:
        session = db.query(VivaSession).filter(VivaSession.id == req.session_id).first()
        if session:
            current_conv = list(session.conversation or [])
            current_conv.append({"speaker": "student", "message": req.student_answer})
            if evaluation["next_question"]:
                current_conv.append({"speaker": "examiner", "message": evaluation["next_question"]})
            session.conversation = current_conv
            session.score = evaluation["score"]
            session.feedback = {
                "summary": evaluation["feedback_summary"],
                "strengths": evaluation["strengths"],
                "missing_points": evaluation["missing_points"]
            }
            db.commit()

    return VivaEvaluationResponse(
        score=evaluation["score"],
        feedback_summary=evaluation["feedback_summary"],
        strengths=evaluation["strengths"],
        missing_points=evaluation["missing_points"],
        next_question=evaluation["next_question"],
        is_completed=evaluation["is_completed"]
    )
