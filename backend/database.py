import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Load .env from backend directory or parent workspace
env_path = Path(__file__).resolve().parent / ".env"
parent_env_path = Path(__file__).resolve().parent.parent / ".env"

if env_path.exists():
    load_dotenv(dotenv_path=env_path)
elif parent_env_path.exists():
    load_dotenv(dotenv_path=parent_env_path)
else:
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Fix for SQLAlchemy with psycopg2 driver if postgresql:// is provided
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# On Vercel (serverless), the project root is read-only.
# Use /tmp for SQLite which is always writable on serverless platforms.
# Locally, use the backend directory as before.
IS_VERCEL = os.getenv("VERCEL", "") == "1" or os.getenv("VERCEL_ENV", "") != ""
if IS_VERCEL:
    sqlite_path = Path("/tmp/ostutorllm.db")
else:
    sqlite_path = Path(__file__).resolve().parent / "ostutorllm.db"
sqlite_url = f"sqlite:///{sqlite_path.as_posix()}"

engine = None
is_postgres = False

if DATABASE_URL and not DATABASE_URL.startswith("sqlite"):
    try:
        # Test connecting with a short timeout to catch paused Supabase or offline DB
        test_engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 5}
        )
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        engine = test_engine
        is_postgres = True
        print("[DB] Connected successfully to remote PostgreSQL database!")
    except Exception as e:
        print(f"[DB] Remote PostgreSQL connection not available ({e}).")
        print(f"[DB] Switching to SQLite at {sqlite_path}.")
        engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
else:
    print(f"[DB] No DATABASE_URL set. Using SQLite at {sqlite_path}.")
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
