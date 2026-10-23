from typing import Dict, Any, List
from sqlalchemy.orm import Session
from models import User, Topic, TopicProgress, Attempt, VivaSession, LabExperiment, Question

class AdaptiveEngine:
    @staticmethod
    def get_dashboard_data(db: Session, user_id: int) -> Dict[str, Any]:
        user = db.query(User).filter(User.id == user_id).first()
        user_name = user.name.capitalize() if user else "Student"

        # Fetch all topics
        all_topics = db.query(Topic).all()
        progress_records = db.query(TopicProgress).filter(TopicProgress.user_id == user_id).all()
        prog_by_topic = {p.topic_id: p for p in progress_records}

        topics_progress_list = []
        total_acc = 0.0
        topics_with_attempts = 0
        weakest_topic_name = None
        min_acc = 101.0

        for t in all_topics:
            prog = prog_by_topic.get(t.id)
            if prog and prog.attempts_count > 0:
                acc = prog.accuracy
                attempts = prog.attempts_count
                total_acc += acc
                topics_with_attempts += 1
                if acc < min_acc:
                    min_acc = acc
                    weakest_topic_name = t.name
            else:
                acc = 0.0
                attempts = 0

            is_weak = (acc < 60.0 and attempts > 0)

            topics_progress_list.append({
                "topic_id": t.id,
                "topic_name": t.name,
                "module": t.module,
                "accuracy": round(acc, 1),
                "attempts_count": attempts,
                "is_weak": is_weak
            })

        # Calculate true overall progress based on curriculum topics
        num_topics = max(len(all_topics), 1)
        overall_progress = round(total_acc / num_topics, 1)

        # Count real total attempts and vivas for THIS specific user
        total_attempts = db.query(Attempt).filter(Attempt.user_id == user_id).count()
        total_vivas = db.query(VivaSession).filter(VivaSession.user_id == user_id).count()

        # Dynamic recommendations based on weakest topic or initial start
        recommendations = []
        if weakest_topic_name:
            if "synchronization" in weakest_topic_name.lower():
                recommendations = [
                    {
                        "topic": weakest_topic_name,
                        "action": "Revise Semaphores & Dining Philosophers",
                        "reason": f"Accuracy is at {min_acc}% (below 60% mastery threshold)",
                        "priority": "high"
                    },
                    {
                        "topic": weakest_topic_name,
                        "action": "Attempt 5 targeted MCQs",
                        "reason": "Reinforce atomic operations wait() & signal()",
                        "priority": "high"
                    },
                    {
                        "topic": weakest_topic_name,
                        "action": "Take an AI Viva session",
                        "reason": "Explain producer-consumer race condition resolution",
                        "priority": "medium"
                    }
                ]
            elif "memory" in weakest_topic_name.lower():
                recommendations = [
                    {
                        "topic": weakest_topic_name,
                        "action": "Review TLB & Address Translation",
                        "reason": f"Accuracy is at {min_acc}%",
                        "priority": "high"
                    },
                    {
                        "topic": weakest_topic_name,
                        "action": "Run Page Replacement Simulator",
                        "reason": "Observe Belady's anomaly in FIFO vs. Optimal",
                        "priority": "high"
                    },
                    {
                        "topic": weakest_topic_name,
                        "action": "Practice 5 MCQs on Demand Paging",
                        "reason": "Test understanding of page fault handling steps",
                        "priority": "medium"
                    }
                ]
            elif "deadlock" in weakest_topic_name.lower():
                recommendations = [
                    {
                        "topic": weakest_topic_name,
                        "action": "Revise 4 Coffman Conditions & RAG",
                        "reason": f"Accuracy is at {min_acc}%",
                        "priority": "high"
                    },
                    {
                        "topic": weakest_topic_name,
                        "action": "Run Banker's Algorithm in OS Labs",
                        "reason": "Observe safety sequences and avoidance steps",
                        "priority": "high"
                    },
                    {
                        "topic": weakest_topic_name,
                        "action": "Attempt 5 MCQs on Deadlock Detection",
                        "reason": "Solidify Resource-Allocation Graph concepts",
                        "priority": "medium"
                    }
                ]
            else:
                recommendations = [
                    {
                        "topic": weakest_topic_name,
                        "action": f"Practice 5 questions in {weakest_topic_name}",
                        "reason": f"Current accuracy is {min_acc}%",
                        "priority": "high"
                    },
                    {
                        "topic": weakest_topic_name,
                        "action": f"Take AI Viva on {weakest_topic_name}",
                        "reason": "Strengthen conceptual articulation",
                        "priority": "medium"
                    }
                ]
        else:
            # For a student with no attempts yet
            recommendations = [
                {
                    "topic": "Getting Started",
                    "action": "Take an initial diagnostic quiz in Exam Mode",
                    "reason": "Establish baseline mastery across Operating Systems topics",
                    "priority": "high"
                },
                {
                    "topic": "Course Materials",
                    "action": "Read Module 2 CPU Scheduling notes",
                    "reason": "Available in the Knowledge Base course notes",
                    "priority": "normal"
                },
                {
                    "topic": "AI Viva",
                    "action": "Attempt an AI Viva Voce oral exam",
                    "reason": "Practice answering questions from the AI examiner",
                    "priority": "normal"
                }
            ]

        # Recent activities dynamically retrieved from database
        recent_activity = []
        recent_attempts = db.query(Attempt).filter(Attempt.user_id == user_id).order_by(Attempt.id.desc()).limit(2).all()
        for att in recent_attempts:
            q = db.query(Question).filter(Question.id == att.question_id).first()
            topic_title = q.topic.name if q and q.topic else "Exam Mode"
            status = "Correct (+1)" if att.is_correct else "Incorrect (0)"
            recent_activity.append({
                "type": "quiz",
                "title": f"Quiz: {topic_title}",
                "time": "Recent Attempt",
                "badge": status
            })

        recent_vivas = db.query(VivaSession).filter(VivaSession.user_id == user_id).order_by(VivaSession.id.desc()).limit(2).all()
        for v in recent_vivas:
            recent_activity.append({
                "type": "viva",
                "title": f"AI Viva: {v.topic}",
                "time": "Recent Session",
                "badge": f"{v.score}/10 Score"
            })

        if not recent_activity:
            recent_activity = [
                {"type": "quiz", "title": f"Profile ready for {user_name}", "time": "Just registered", "badge": "New Student"}
            ]

        return {
            "user_name": user_name,
            "overall_progress": overall_progress,
            "total_questions_attempted": total_attempts,
            "total_vivas_conducted": total_vivas,
            "weakest_topic": weakest_topic_name or "None yet (New Student)",
            "topics_progress": topics_progress_list,
            "recommendations": recommendations,
            "recent_activity": recent_activity
        }

adaptive_engine = AdaptiveEngine()
