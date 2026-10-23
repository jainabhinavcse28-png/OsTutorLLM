import os
import re
import math
from typing import List, Dict, Any, Optional

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))

class RAGService:
    def __init__(self, data_dir: str = DATA_DIR):
        self.data_dir = data_dir
        self.chunks: List[Dict[str, Any]] = []
        self.doc_freq: Dict[str, int] = {}
        self.vocab = set()
        self._load_and_chunk_documents()

    def _tokenize(self, text: str) -> List[str]:
        # Lowercase and extract alphanumeric words
        return re.findall(r'\b[a-z0-9_-]{2,}\b', text.lower())

    def _load_and_chunk_documents(self):
        self.chunks = []
        if not os.path.exists(self.data_dir):
            return

        for root, _, files in os.walk(self.data_dir):
            for file in files:
                if file.endswith((".md", ".txt")):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, self.data_dir)
                    subfolder = os.path.basename(root)

                    # Infer module
                    module_name = "General OS"
                    if "module1" in file.lower() or "overview" in file.lower():
                        module_name = "Module 1 - OS Overview & System Calls"
                    elif "module2" in file.lower() or "cpu" in file.lower() or "process" in file.lower():
                        module_name = "Module 2 - Process Management & CPU Scheduling"
                    elif "module3" in file.lower() or "synchronization" in file.lower():
                        module_name = "Module 3 - Process Synchronization"
                    elif "module4" in file.lower() or "deadlock" in file.lower():
                        module_name = "Module 4 - Deadlocks"
                    elif "module5" in file.lower() or "memory" in file.lower():
                        module_name = "Module 5 - Memory Management & Virtual Memory"
                    elif "module6" in file.lower() or "file" in file.lower():
                        module_name = "Module 6 - Storage & File Systems"
                    elif "lab" in file.lower() or "lab" in subfolder.lower():
                        module_name = "OS Lab Manual Experiments"
                    elif "viva" in file.lower() or "viva" in subfolder.lower():
                        module_name = "OS Viva Voce Bank"
                    elif "syllabus" in file.lower() or "syllabus" in subfolder.lower():
                        module_name = "OS Course Syllabus"

                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()

                        # Split into sections based on markdown headers
                        sections = re.split(r'\n(?=#{1,3}\s+)', content)
                        for sec in sections:
                            sec = sec.strip()
                            if not sec:
                                continue
                            
                            lines = sec.split("\n")
                            header = lines[0].replace("#", "").strip() if lines else file
                            body = "\n".join(lines[1:]).strip() if len(lines) > 1 else sec

                            # Split larger sections into 300-word chunks if needed
                            words = body.split()
                            chunk_size = 250
                            if len(words) > chunk_size:
                                for i in range(0, len(words), chunk_size - 50):
                                    sub_text = " ".join(words[i:i + chunk_size])
                                    self._add_chunk(file, header, module_name, sub_text)
                            else:
                                self._add_chunk(file, header, module_name, body or header)
                    except Exception as e:
                        print(f"Error reading file {file_path}: {e}")

        # Compute document frequencies
        self._build_index()

    def _add_chunk(self, filename: str, header: str, module: str, text: str):
        tokens = self._tokenize(header + " " + text)
        snippet = text[:220] + "..." if len(text) > 220 else text
        self.chunks.append({
            "document": filename,
            "section": header,
            "module": module,
            "content": text,
            "snippet": snippet,
            "tokens": tokens,
            "token_count": len(tokens)
        })

    def _build_index(self):
        self.doc_freq = {}
        total_chunks = len(self.chunks)
        for chunk in self.chunks:
            unique_tokens = set(chunk["tokens"])
            for tok in unique_tokens:
                self.doc_freq[tok] = self.doc_freq.get(tok, 0) + 1

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_tokens = self._tokenize(query)
        if not query_tokens or not self.chunks:
            return []

        num_docs = len(self.chunks)
        scored = []

        for chunk in self.chunks:
            score = 0.0
            chunk_tokens = chunk["tokens"]
            chunk_len = max(chunk["token_count"], 1)

            for token in query_tokens:
                if token in chunk_tokens:
                    tf = chunk_tokens.count(token) / chunk_len
                    df = self.doc_freq.get(token, 1)
                    idf = math.log((num_docs + 1) / (df + 0.5)) + 1.0
                    score += tf * idf

                    # Exact match boost for header / section
                    if token in chunk["section"].lower():
                        score += 0.8
                    if token in chunk["module"].lower():
                        score += 0.4

            if score > 0:
                scored.append((score, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        seen_sections = set()

        for score, chunk in scored:
            key = f"{chunk['document']}::{chunk['section']}"
            if key in seen_sections:
                continue
            seen_sections.add(key)
            results.append({
                "document": chunk["document"],
                "module": chunk["module"],
                "section": chunk["section"],
                "snippet": chunk["snippet"],
                "content": chunk["content"],
                "relevance_score": round(score, 4)
            })
            if len(results) >= top_k:
                break

        return results

rag_engine = RAGService()
