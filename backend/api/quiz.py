import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Topic, Question, Attempt, TopicProgress
from schemas import (
    QuizGenerateRequest, QuestionDTO, QuizSubmitRequest,
    QuizSubmitResponse, QuestionResult
)

router = APIRouter()

@router.get("/quiz/topics")
def get_quiz_topics(db: Session = Depends(get_db)):
    topics = db.query(Topic).all()
    results = []
    for t in topics:
        q_count = db.query(Question).filter(Question.topic_id == t.id).count()
        results.append({
            "id": t.id,
            "name": t.name,
            "module": t.module,
            "description": t.description,
            "question_count": q_count
        })
    return results

@router.post("/quiz/generate")
def generate_quiz(req: QuizGenerateRequest, db: Session = Depends(get_db)):
    query = db.query(Question)

    if req.topic and req.topic != "All Topics":
        topic_obj = db.query(Topic).filter(Topic.name == req.topic).first()
        if topic_obj:
            query = query.filter(Question.topic_id == topic_obj.id)

    if req.difficulty and req.difficulty != "Mixed":
        query = query.filter(Question.difficulty == req.difficulty)

    questions = query.all()
    if not questions:
        # Fall back to any questions in topic or all
        if req.topic and req.topic != "All Topics":
            topic_obj = db.query(Topic).filter(Topic.name == req.topic).first()
            if topic_obj:
                questions = db.query(Question).filter(Question.topic_id == topic_obj.id).all()
        if not questions:
            questions = db.query(Question).all()

    # Pick up to num_questions randomly
    sample_size = min(len(questions), req.num_questions)
    selected = random.sample(questions, sample_size) if sample_size > 0 else []

    # Map to QuestionDTO
    dto_list = []
    topic_cache = {}
    for q in selected:
        if q.topic_id not in topic_cache:
            top = db.query(Topic).filter(Topic.id == q.topic_id).first()
            topic_cache[q.topic_id] = top.name if top else "Operating Systems"

        dto_list.append(QuestionDTO(
            id=q.id,
            topic=topic_cache[q.topic_id],
            subconcept=q.subconcept,
            difficulty=q.difficulty,
            question=q.question,
            options=q.options
        ))

    return dto_list

@router.post("/quiz/submit", response_model=QuizSubmitResponse)
def submit_quiz(req: QuizSubmitRequest, db: Session = Depends(get_db)):
    if not req.answers:
        raise HTTPException(status_code=400, detail="No answers provided")

    total = len(req.answers)
    score = 0
    results = []
    strong_concepts = set()
    weak_concepts = set()

    # Find or infer topic ID
    topic_obj = db.query(Topic).filter(Topic.name == req.topic).first()

    for item in req.answers:
        q = db.query(Question).filter(Question.id == item.question_id).first()
        if not q:
            continue

        is_correct = (item.selected_option.strip().upper() == q.answer.strip().upper())
        if is_correct:
            score += 1
            if q.subconcept:
                strong_concepts.add(q.subconcept)
        else:
            if q.subconcept:
                weak_concepts.add(q.subconcept)

        results.append(QuestionResult(
            question_id=q.id,
            question=q.question,
            selected_option=item.selected_option,
            correct_answer=q.answer,
            is_correct=is_correct,
            explanation=q.explanation,
            subconcept=q.subconcept
        ))

        # Save attempt to DB
        try:
            attempt = Attempt(
                user_id=req.user_id,
                question_id=q.id,
                selected_option=item.selected_option,
                is_correct=is_correct,
                score=1.0 if is_correct else 0.0
            )
            db.add(attempt)
        except Exception as e:
            print(f"Error saving attempt: {e}")

    # Update TopicProgress in database
    if topic_obj:
        prog = db.query(TopicProgress).filter(
            TopicProgress.user_id == req.user_id,
            TopicProgress.topic_id == topic_obj.id
        ).first()

        if prog:
            new_attempts = prog.attempts_count + total
            new_correct = prog.correct_count + score
            new_acc = (new_correct / new_attempts) * 100.0 if new_attempts > 0 else 0.0
            prog.attempts_count = new_attempts
            prog.correct_count = new_correct
            prog.accuracy = round(new_acc, 1)
        else:
            new_acc = (score / total) * 100.0 if total > 0 else 0.0
            prog = TopicProgress(
                user_id=req.user_id,
                topic_id=topic_obj.id,
                attempts_count=total,
                correct_count=score,
                accuracy=round(new_acc, 1)
            )
            db.add(prog)

    db.commit()

    pct = round((score / total) * 100, 1) if total > 0 else 0.0

    # Build recommendations
    recs = []
    for w in weak_concepts:
        recs.append(f"Revise {w} notes in Knowledge Base and re-attempt targeted quiz")
    if pct < 70.0:
        recs.append(f"Schedule an AI Viva session on {req.topic} to clarify missing concepts")
    else:
        recs.append(f"Great score! Challenge yourself with Hard difficulty in {req.topic}")

    return QuizSubmitResponse(
        score=score,
        total=total,
        percentage=pct,
        strong_topics=list(strong_concepts),
        weak_topics=list(weak_concepts),
        recommendations=recs,
        results=results
    )
