import sys
import os

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal, Base
from models import Topic, init_db

# Import API routers
from api.users import router as users_router
from api.chat import router as chat_router
from api.quiz import router as quiz_router
from api.viva import router as viva_router
from api.lab import router as lab_router
from api.dashboard import router as dashboard_router
from api.documents import router as documents_router

app = FastAPI(
    title="OSTutorLLM",
    description="AI-Powered Operating Systems Learning Platform API",
    version="1.0.0"
)

# Configure CORS for local development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    try:
        init_db()
        db = SessionLocal()
        # If topics table is empty, auto-seed topics, questions, and baseline students
        if db.query(Topic).count() == 0:
            print("Database has no topics. Auto-seeding initial dataset...")
            from seed_data import seed_all
            seed_all()
        db.close()
        print("Database schema and data verified on startup.")
    except Exception as e:
        print(f"Startup database warning: {e}")

@app.get("/health")
def health():
    return {
        "status": "OSTutorLLM backend is running",
        "service": "OSTutorLLM Core API",
        "features": [
            "Ask OS (RAG Chatbot)",
            "Exam Mode (Adaptive Assessment)",
            "AI Viva (Interactive Examiner)",
            "OS Lab Assistant (Simulators)",
            "Student Dashboard & Analytics"
        ]
    }

# Register all API routers
app.include_router(users_router, prefix="/api/v1", tags=["Users"])
app.include_router(chat_router, prefix="/api/v1", tags=["Ask OS"])
app.include_router(quiz_router, prefix="/api/v1", tags=["Exam Mode"])
app.include_router(viva_router, prefix="/api/v1", tags=["AI Viva"])
app.include_router(lab_router, prefix="/api/v1", tags=["OS Lab Assistant"])
app.include_router(dashboard_router, prefix="/api/v1", tags=["Student Dashboard"])
app.include_router(documents_router, prefix="/api/v1", tags=["Course Materials"])
