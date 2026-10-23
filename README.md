# OSTutorLLM — AI-Powered Operating Systems Learning Platform

> **Built a syllabus-aware AI tutor using RAG, FastAPI, React, and PostgreSQL that retrieves course material, generates grounded explanations/assessments, conducts AI viva sessions, simulates core OS algorithms, and tracks weak topics.**

---

## 🌟 Overview: 5 Products Inside One Platform

OSTutorLLM implements the complete learning loop: **ASK → RETRIEVE → GENERATE → PRACTICE → ADAPT**.

```
                    OSTutorLLM
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
     ASK OS           EXAM MODE        AI VIVA
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                   LEARNING ENGINE
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
        OS LAB ASSISTANT       PROGRESS DASHBOARD
```

1. **Ask OS (Feature 1)**: RAG-powered chatbot that converts student queries into embeddings, searches course lecture notes and textbooks, and provides grounded explanations accompanied by verified syllabus citations.
2. **RAG Knowledge Base (Feature 2)**: Modular courseware ingest pipeline indexing syllabus, lectures, textbooks, lab manuals, and viva question banks with semantic TF-IDF / vector retrieval.
3. **Exam Mode (Feature 3)**: Topic- and difficulty-based MCQ assessment generator with instant scoring, analysis of strong vs. weak concepts, and adaptive study recommendations.
4. **AI Viva (Feature 4)**: Interactive oral examination conducted by an AI examiner that poses conceptual questions, evaluates student answers on technical depth, checks for missing points, and formulates adaptive follow-up questions.
5. **OS Lab Assistant (Feature 5)**: Algorithmic simulators with interactive visualizations:
   - **CPU Scheduling**: FCFS, SJF, SRTF, Round Robin (custom time quantum), Priority scheduling with live Gantt Chart.
   - **Banker's Algorithm**: Need matrix computation ($Max - Allocation$), safety sequence determination, and resource-request deadlock avoidance checks.
   - **Page Replacement**: Step-by-step frame matrix allocation table with color-coded Hits and Faults for FIFO (testing Belady's Anomaly), LRU, and Optimal algorithms.
6. **Adaptive Learning Engine (Feature 6)**: Continuously analyzes student attempts, calculates per-topic mastery percentages, flags weak areas (accuracy $< 60\%$), and synthesizes targeted study roadmaps.
7. **Student Dashboard (Feature 7)**: Executive learning dashboard displaying overall progress, topic mastery progress bars, weak topic alert banners, and recent activity history.

---

## 🏗️ Architecture & Tech Stack

```
React (Vite + Tailwind CSS + Lucide Icons)
   │
   │ REST API (JSON)
   ↓
FastAPI Backend (Python)
   │
   ├── Authentication & Users Router (/api/v1/users)
   ├── Ask OS / RAG Chat Router (/api/v1/chat)
   ├── Exam Mode Router (/api/v1/quiz)
   ├── AI Viva Router (/api/v1/viva)
   ├── OS Lab Simulators Router (/api/v1/lab)
   └── Dashboard & Analytics Router (/api/v1/dashboard)
          │
          ├── PostgreSQL Database (Supabase / SQLAlchemy ORM)
          ├── RAG Engine (Chunking, TF-IDF Inverted Index, Citations)
          ├── Algorithmic Simulators (CPU, Banker's, Page Replacement)
          └── Dual-Engine LLM Service (Gemini API + Grounded OS Fallback)
```

- **Frontend**: React 19, Vite 8, Tailwind CSS, Lucide React
- **Backend**: FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn
- **Database**: PostgreSQL (Supabase cloud / Local)
- **AI & RAG**: Google Gemini API, TF-IDF / Inverted Vector Store, Chunking pipeline
- **Operating Systems Coverage**: Process Management, CPU Scheduling, Process Synchronization, Deadlocks, Memory Management, Virtual Memory, File Systems

---

## 🗄️ Database Schema

The database model is implemented in PostgreSQL via SQLAlchemy (`backend/models.py`):

| Table | Columns | Purpose |
|---|---|---|
| `users` | `id`, `name`, `email`, `created_at` | Student profiles |
| `topics` | `id`, `name`, `module`, `description` | Syllabus topic taxonomy |
| `documents` | `id`, `filename`, `title`, `topic`, `module`, `content`, `file_type` | Ingested course materials |
| `questions` | `id`, `topic_id`, `difficulty`, `question`, `options`, `answer`, `explanation`, `subconcept` | Question bank |
| `attempts` | `id`, `user_id`, `question_id`, `selected_option`, `is_correct`, `score`, `created_at` | Question attempt logs |
| `topic_progress`| `id`, `user_id`, `topic_id`, `accuracy`, `attempts_count`, `correct_count`, `last_attempt` | Topic mastery analytics |
| `viva_sessions` | `id`, `user_id`, `topic`, `score`, `conversation`, `feedback`, `created_at` | Viva transcripts & scores |
| `chat_history` | `id`, `user_id`, `question`, `answer`, `sources`, `created_at` | Ask OS queries & citations |
| `lab_experiments`| `id`, `user_id`, `algorithm_type`, `input_data`, `result_data`, `created_at` | Lab simulator run logs |

---

## 📁 Repository Structure

```
OSTutorLLM/
│
├── backend/
│   ├── api/
│   │   ├── chat.py           # Ask OS & RAG citation endpoint
│   │   ├── quiz.py           # Exam Mode generation & grading
│   │   ├── viva.py           # AI Viva examiner dialogue & evaluation
│   │   ├── lab.py            # CPU, Banker's & Page replacement simulators
│   │   ├── dashboard.py      # Adaptive student dashboard
│   │   ├── documents.py      # Knowledge base courseware
│   │   └── users.py          # PostgreSQL user profiles
│   ├── services/
│   │   ├── rag.py            # RAG search engine & chunk indexer
│   │   ├── llm.py            # Gemini API & grounded OS pedagogical fallback
│   │   ├── os_algorithms.py  # Real scheduling, Banker's & paging algorithms
│   │   └── adaptive.py       # Adaptive analytics & recommendation engine
│   ├── models.py             # SQLAlchemy ORM models
│   ├── schemas.py            # Pydantic request & response schemas
│   ├── database.py           # Database connection & session management
│   ├── seed_data.py          # Database seeding script
│   ├── main.py               # FastAPI application entry point
│   ├── requirements.txt      # Python dependencies
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardTab.jsx      # Adaptive dashboard & progress bars
│   │   │   ├── AskOSTab.jsx          # RAG chatbot with citations drawer
│   │   │   ├── ExamModeTab.jsx       # MCQ assessment & review report
│   │   │   ├── AIVivaTab.jsx         # Oral examiner dialogue & scorecard
│   │   │   ├── OSLabAssistantTab.jsx # CPU Gantt, Banker's & Frame simulators
│   │   │   ├── KnowledgeBaseTab.jsx  # Course reader & notes explorer
│   │   │   └── UsersTab.jsx          # PostgreSQL live user manager
│   │   ├── services/
│   │   │   └── api.js                # Frontend API client
│   │   ├── App.jsx                   # Main layout and tab orchestrator
│   │   └── index.css                 # Tailwind CSS styles
│   └── package.json
│
├── data/
│   ├── syllabus/                     # Course syllabus & outcomes
│   ├── lectures/                     # Modules 1-6 detailed lecture notes
│   ├── lab_manual/                   # OS practical lab experiments
│   └── viva_questions/               # Oral exam question bank
│
├── rag/
│   ├── ingest.py                     # Document parser & database seeder
│   ├── chunk.py                      # Markdown header-based chunker
│   ├── embed.py                      # TF-IDF vector indexer
│   └── retrieve.py                   # Command-line retrieval utility
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database (Supabase, Neon, or local)

### 2. Backend Setup
```bash
cd backend

# Configure environment variables
# Copy .env.example to .env and set your DATABASE_URL and optional GEMINI_API_KEY
cp .env.example .env

# Seed topics, question bank, documents, and student baseline progress
python seed_data.py

# Launch FastAPI server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be running at `http://127.0.0.1:8000`. Interactive Swagger docs are available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite dev server
npm run dev
```
Frontend will be running at `http://localhost:5173`.

---

## 🧪 Verification & Features Testing

- **Ask OS**: Ask `"What is virtual memory and how does paging work?"` or `"Explain the difference between process and thread"`. Observe structured answers and verified source citations with exact document and section references.
- **Exam Mode**: Select topic **Memory Management**, difficulty **Medium**, and start test. Answer questions and view instant score report, strong vs. weak concept breakdown, and detailed explanations.
- **AI Viva**: Start viva on **Process Management & CPU Scheduling**. Answer the examiner's question. Review the score (e.g. 7.5/10), checklist of correct points, missing points, and answer the adaptive follow-up question.
- **OS Labs**: Run **Round Robin** ($q=2$) on CPU Scheduling to view the colored interactive Gantt chart. Run **Banker's Algorithm** to compute the Need matrix and safe sequence $\langle P_1, P_3, P_4, P_0, P_2 \rangle$. Run **Page Replacement** with reference string `1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5` to observe Belady's Anomaly.
- **Dashboard**: View Abhinav's overall progress ($67\%$), topic breakdown, and adaptive study recommendations.
