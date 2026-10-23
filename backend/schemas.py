from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr

# User Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Topic Schemas
class TopicResponse(BaseModel):
    id: int
    name: str
    module: str
    description: Optional[str] = None
    question_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Document Schemas
class DocumentResponse(BaseModel):
    id: int
    filename: str
    title: str
    topic: str
    module: str
    content: str
    file_type: str

    class Config:
        from_attributes = True

# Chat / Ask OS Schemas
class SourceCitation(BaseModel):
    document: str
    module: str
    section: Optional[str] = None
    snippet: str

class ChatRequest(BaseModel):
    user_id: Optional[int] = 1
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]
    topic: Optional[str] = None

class ChatHistoryItem(BaseModel):
    id: int
    question: str
    answer: str
    sources: List[Any]
    created_at: Optional[datetime] = None

# Quiz / Exam Mode Schemas
class QuizGenerateRequest(BaseModel):
    topic: str  # Topic name or "All Topics"
    difficulty: str = "Medium"  # Easy, Medium, Hard, Mixed
    num_questions: int = 5

class QuestionDTO(BaseModel):
    id: int
    topic: str
    subconcept: Optional[str] = None
    difficulty: str
    question: str
    options: List[str]

class AnswerItem(BaseModel):
    question_id: int
    selected_option: str  # "A", "B", "C", "D"

class QuizSubmitRequest(BaseModel):
    user_id: int = 1
    topic: str
    answers: List[AnswerItem]

class QuestionResult(BaseModel):
    question_id: int
    question: str
    selected_option: str
    correct_answer: str
    is_correct: bool
    explanation: Optional[str] = None
    subconcept: Optional[str] = None

class QuizSubmitResponse(BaseModel):
    score: int
    total: int
    percentage: float
    strong_topics: List[str]
    weak_topics: List[str]
    recommendations: List[str]
    results: List[QuestionResult]

# AI Viva Schemas
class VivaStartRequest(BaseModel):
    user_id: int = 1
    topic: str

class VivaStartResponse(BaseModel):
    session_id: int
    topic: str
    initial_question: str
    instruction: str

class VivaTurn(BaseModel):
    speaker: str  # "examiner" or "student"
    message: str

class VivaRespondRequest(BaseModel):
    session_id: Optional[int] = None
    user_id: int = 1
    topic: str
    student_answer: str
    conversation_history: List[VivaTurn]

class VivaEvaluationResponse(BaseModel):
    score: float  # Out of 10
    feedback_summary: str
    strengths: List[str]
    missing_points: List[str]
    next_question: Optional[str] = None
    is_completed: bool = False

# Lab Assistant Schemas
class ProcessItem(BaseModel):
    pid: str
    arrival_time: int
    burst_time: int
    priority: Optional[int] = 0

class GanttBlock(BaseModel):
    pid: str
    start: int
    end: int

class ProcessResult(BaseModel):
    pid: str
    arrival_time: int
    burst_time: int
    completion_time: int
    turnaround_time: int
    waiting_time: int

class CPUSchedulingRequest(BaseModel):
    algorithm: str  # FCFS, SJF, SRTF, Round Robin, Priority
    time_quantum: Optional[int] = 2
    processes: List[ProcessItem]

class CPUSchedulingResponse(BaseModel):
    algorithm: str
    gantt_chart: List[GanttBlock]
    process_table: List[ProcessResult]
    avg_turnaround_time: float
    avg_waiting_time: float
    cpu_utilization: float

class BankersRequest(BaseModel):
    processes: List[str]  # ["P0", "P1", "P2", "P3", "P4"]
    resources: List[str]  # ["A", "B", "C"]
    allocation: List[List[int]]
    max_matrix: List[List[int]]
    available: List[int]
    request_process: Optional[str] = None
    request_vector: Optional[List[int]] = None

class BankersResponse(BaseModel):
    is_safe: bool
    need_matrix: List[List[int]]
    safe_sequence: List[str]
    trace: List[str]
    message: str

class PageReplacementRequest(BaseModel):
    algorithm: str  # FIFO, LRU, Optimal
    frames_count: int
    reference_string: List[int]

class PageStep(BaseModel):
    page: int
    frames: List[Optional[int]]
    status: str  # "HIT" or "FAULT"

class PageReplacementResponse(BaseModel):
    algorithm: str
    steps: List[PageStep]
    total_references: int
    hits: int
    faults: int
    hit_ratio: float
    fault_ratio: float

# Adaptive Learning & Dashboard Schemas
class TopicProgressDTO(BaseModel):
    topic_id: int
    topic_name: str
    module: str
    accuracy: float
    attempts_count: int
    is_weak: bool

class RecommendationDTO(BaseModel):
    topic: str
    action: str
    reason: str
    priority: str  # "high", "medium", "normal"

class DashboardResponse(BaseModel):
    user_name: str
    overall_progress: float
    total_questions_attempted: int
    total_vivas_conducted: int
    weakest_topic: Optional[str] = None
    topics_progress: List[TopicProgressDTO]
    recommendations: List[RecommendationDTO]
    recent_activity: List[Dict[str, Any]]