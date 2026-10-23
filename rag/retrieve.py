"""
RAG Retrieval API for OSTutorLLM
"""
from backend.services.rag import rag_engine

def retrieve_relevant_os_chunks(query: str, top_k: int = 3):
    return rag_engine.search(query, top_k=top_k)

if __name__ == "__main__":
    import sys
    q = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Explain virtual memory and page faults"
    print(f"Retrieving for: {q}")
    for res in retrieve_relevant_os_chunks(q):
        print(f"\n[Source: {res['document']} - {res['section']}]")
        print(res['snippet'])
