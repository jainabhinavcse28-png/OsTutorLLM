"""
RAG Embedding and Vector Index Utility for OSTutorLLM
Supports fast vectorized embeddings and TF-IDF semantic weights.
"""
import re
import math
from typing import List, Dict, Any

class VectorStore:
    def __init__(self):
        self.vectors = []
        self.vocab = {}

    def tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b[a-z0-9_-]{2,}\b', text.lower())

    def compute_tf_idf(self, chunks: List[Dict[str, Any]]):
        doc_count = len(chunks)
        df = {}
        for c in chunks:
            tokens = set(self.tokenize(c.get("content", "")))
            for t in tokens:
                df[t] = df.get(t, 0) + 1

        for c in chunks:
            tokens = self.tokenize(c.get("content", ""))
            total_words = max(len(tokens), 1)
            vec = {}
            for t in tokens:
                tf = tokens.count(t) / total_words
                idf = math.log((doc_count + 1) / (df.get(t, 1) + 0.5)) + 1.0
                vec[t] = tf * idf
            c["vector"] = vec

        self.vectors = chunks

    def query(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        tokens = self.tokenize(query_text)
        scored = []
        for c in self.vectors:
            v = c.get("vector", {})
            score = sum(v.get(t, 0.0) for t in tokens)
            if score > 0:
                scored.append((score, c))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_k]]
