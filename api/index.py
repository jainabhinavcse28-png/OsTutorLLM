import sys
import os

# Add backend directory to sys.path so all backend modules resolve correctly
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
sys.path.insert(0, os.path.abspath(backend_dir))

# Import the FastAPI app — Vercel wraps this as a serverless function
from main import app
