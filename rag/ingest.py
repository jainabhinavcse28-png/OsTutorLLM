"""
Ingestion script for OSTutorLLM:
Reads markdown/text course files from data/ and seeds the database documents table.
"""
import os
import sys

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from database import SessionLocal
from models import Document, init_db
from services.rag import DATA_DIR

def ingest_course_materials():
    init_db()
    db = SessionLocal()
    try:
        count = 0
        for root, _, files in os.walk(DATA_DIR):
            for file in files:
                if file.endswith((".md", ".txt")):
                    path = os.path.join(root, file)
                    rel_folder = os.path.basename(root)
                    with open(path, "r", encoding="utf-8") as f:
                        text = f.read()

                    title = file.replace("_", " ").replace(".md", "").title()
                    existing = db.query(Document).filter(Document.filename == file).first()
                    if not existing:
                        doc = Document(
                            filename=file,
                            title=title,
                            topic=rel_folder.title(),
                            module=rel_folder.title(),
                            content=text,
                            file_type="lecture_notes"
                        )
                        db.add(doc)
                        count += 1
        db.commit()
        print(f"Successfully ingested {count} documents into the PostgreSQL database.")
    finally:
        db.close()

if __name__ == "__main__":
    ingest_course_materials()
