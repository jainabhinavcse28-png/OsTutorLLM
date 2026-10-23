from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base, engine

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    attempts = relationship("Attempt", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("TopicProgress", back_populates="user", cascade="all, delete-orphan")
    viva_sessions = relationship("VivaSession", back_populates="user", cascade="all, delete-orphan")
    chat_histories = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    lab_experiments = relationship("LabExperiment", back_populates="user", cascade="all, delete-orphan")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    module = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    questions = relationship("Question", back_populates="topic")
    progress = relationship("TopicProgress", back_populates="topic")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    topic = Column(String(100), nullable=False)
    module = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    file_type = Column(String(50), default="lecture_note")
    created_at = Column(DateTime, default=datetime.utcnow)


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    difficulty = Column(String(50), default="Medium")  # Easy, Medium, Hard
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # e.g. ["Page Table", "TLB", "Cache Controller", "DMA"]
    answer = Column(String(10), nullable=False)  # "A", "B", "C", "D"
    explanation = Column(Text, nullable=True)
    subconcept = Column(String(100), nullable=True)  # e.g. "TLB", "Paging", "Deadlock Detection"

    topic = relationship("Topic", back_populates="questions")
    attempts = relationship("Attempt", back_populates="question")


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_option = Column(String(10), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    score = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="attempts")
    question = relationship("Question", back_populates="attempts")


class TopicProgress(Base):
    __tablename__ = "topic_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    accuracy = Column(Float, default=0.0)  # Percentage 0.0 - 100.0
    attempts_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    last_attempt = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress")
    topic = relationship("Topic", back_populates="progress")


class VivaSession(Base):
    __tablename__ = "viva_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(100), nullable=False)
    score = Column(Float, default=0.0)
    conversation = Column(JSON, default=list)  # List of message exchanges
    feedback = Column(JSON, default=dict)  # {strengths: [], missing: [], recommendations: []}
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="viva_sessions")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_histories")


class LabExperiment(Base):
    __tablename__ = "lab_experiments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    algorithm_type = Column(String(100), nullable=False)  # "cpu_scheduling", "bankers", "page_replacement"
    input_data = Column(JSON, nullable=False)
    result_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="lab_experiments")


def init_db():
    Base.metadata.create_all(bind=engine)