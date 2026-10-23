"""
RAG Chunking Utility for OSTutorLLM
Extracts text and chunks syllabus, lecture notes, textbooks, and lab manuals.
"""
import re
from typing import List, Dict, Any

def chunk_markdown_text(content: str, filename: str, chunk_size: int = 250) -> List[Dict[str, Any]]:
    chunks = []
    sections = re.split(r'\n(?=#{1,3}\s+)', content)
    for sec in sections:
        sec = sec.strip()
        if not sec:
            continue
        lines = sec.split("\n")
        header = lines[0].replace("#", "").strip() if lines else filename
        body = "\n".join(lines[1:]).strip() if len(lines) > 1 else sec
        words = body.split()
        if len(words) > chunk_size:
            for i in range(0, len(words), chunk_size - 40):
                sub_text = " ".join(words[i:i + chunk_size])
                chunks.append({"header": header, "content": sub_text, "source": filename})
        else:
            chunks.append({"header": header, "content": body or header, "source": filename})
    return chunks
