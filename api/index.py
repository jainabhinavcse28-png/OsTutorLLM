import sys
import os

# Add backend directory to sys.path so all backend modules resolve correctly
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
sys.path.insert(0, os.path.abspath(backend_dir))

# Import the FastAPI app
from main import app

# Wrap with Mangum so FastAPI works inside Vercel's AWS Lambda runtime
from mangum import Mangum
handler = Mangum(app, lifespan="off")
