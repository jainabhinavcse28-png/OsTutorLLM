import os
import json
import re
from typing import List, Dict, Any, Optional

class LLMService:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    def _call_gemini_if_available(self, prompt: str) -> Optional[str]:
        if not self.gemini_api_key:
            return None
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API call failed: {e}. Falling back to grounded OS engine.")
            return None

    def generate_rag_answer(self, question: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
        # Construct context string
        context_text = "\n\n".join([
            f"--- Source: {c.get('document')} ({c.get('module')}) - Section: {c.get('section')} ---\n{c.get('content')}"
            for c in retrieved_chunks
        ])

        prompt = f"""You are OSTutorLLM, an expert academic Operating Systems AI Tutor.
Answer the student's question thoroughly, accurately, and pedagogically using the provided course context.

Context from Course Materials:
{context_text}

Student Question:
{question}

Instructions:
1. Provide a clear, precise definition and core mechanism.
2. Provide a concrete example or practical OS analogy.
3. Highlight key trade-offs, algorithms, or implications.
4. Keep the tone encouraging, structured, and exam-ready.
"""

        api_result = self._call_gemini_if_available(prompt)
        if api_result:
            return api_result

        # Grounded Syllabus OS Expert Engine Fallback
        q_lower = question.lower()
        
        # Check primary themes in question
        if "virtual memory" in q_lower or "page fault" in q_lower or "tlb" in q_lower or "paging" in q_lower:
            return (
                "### 📌 Core Definition\n"
                "**Virtual Memory** is a memory management capability of an operating system that allows the execution of processes that may not be completely loaded into physical RAM. It separates user logical memory from physical memory, creating the illusion of a contiguous, virtually unbounded address space.\n\n"
                "### ⚙️ How It Works\n"
                "1. **Paging & Address Translation**: Logical memory is divided into fixed-size blocks called *pages*, while physical memory is divided into equal-sized *frames* (commonly 4 KB). The CPU's Memory Management Unit (MMU) uses a **Page Table** to translate logical addresses $(p, d)$ into physical addresses $(f, d)$.\n"
                "2. **TLB Acceleration**: To avoid a 2-step memory lookup for every memory access, the CPU utilizes a fast associative hardware cache called the **Translation Lookaside Buffer (TLB)**. A TLB hit resolves addresses in a single clock cycle.\n"
                "3. **Demand Paging & Page Faults**: Pages are brought into RAM only when referenced. If an instruction references a non-resident page (valid bit = 0), a **Page Fault** trap is raised. The OS kernel retrieves the page from disk/swap space into a free frame, updates the page table, and restarts the instruction.\n\n"
                "### 💡 Practical Example\n"
                "When a program requires 16 GB of memory on a machine with only 8 GB of physical RAM, virtual memory allows it to run smoothly by swapping dormant code and data pages out to backing store, keeping only the active *working set* in RAM.\n\n"
                "### ⚠️ Key Design Challenges\n"
                "- **Page Replacement**: When frames are full, the OS must choose a victim page using algorithms like **LRU** (Least Recently Used) or **FIFO** (which suffers from *Belady's Anomaly*).\n"
                "- **Thrashing**: Occurs when a process lacks sufficient frames and spends more time servicing page faults than executing instructions."
            )
        elif "process" in q_lower and "thread" in q_lower:
            return (
                "### 📌 Process vs. Thread\n"
                "- **Process**: An isolated program in execution with its own dedicated address space (code, data, heap, stack), file descriptors, and Process Control Block (PCB). Heavyweight to create and context switch.\n"
                "- **Thread**: A lightweight unit of CPU execution within a process. Multiple threads of the same process share the same virtual address space, global variables, and open files, but keep private program counters, registers, and stacks.\n\n"
                "### ⚙️ Why Thread Context Switching is Cheaper\n"
                "In a process context switch, the OS must save CPU registers, switch page directories, and **flush the Translation Lookaside Buffer (TLB)**. In a thread switch, the address space remains identical, so the TLB cache entries remain valid—saving hundreds of CPU clock cycles.\n\n"
                "### 💡 Practical Example\n"
                "A modern web browser process runs separate threads for rendering UI, executing JavaScript, and downloading network assets concurrently without spawning full heavy processes for each task."
            )
        elif "deadlock" in q_lower or "banker" in q_lower:
            return (
                "### 📌 Deadlocks & Characterization\n"
                "A **Deadlock** is a state where a set of processes are permanently blocked because each holds a resource while waiting for another resource held by another process in the set.\n\n"
                "### ⚙️ The 4 Coffman Conditions (Must hold simultaneously)\n"
                "1. **Mutual Exclusion**: At least one resource must be non-shareable.\n"
                "2. **Hold and Wait**: A process holds a resource while requesting another.\n"
                "3. **No Preemption**: Resources can only be released voluntarily.\n"
                "4. **Circular Wait**: A closed chain of processes waiting for each other ($P_0 \\to P_1 \\to \\dots \\to P_0$).\n\n"
                "### 🛡️ Deadlock Avoidance: Banker's Algorithm\n"
                "Banker's Algorithm tests if resource allocation leaves the system in a **Safe State** (where a sequence $\\langle P_1, \\dots, P_n \\rangle$ exists such that every process can satisfy its declared maximum need using current available resources)."
            )
        elif "cpu scheduling" in q_lower or "round robin" in q_lower or "fcfs" in q_lower or "sjf" in q_lower:
            return (
                "### 📌 CPU Scheduling Fundamentals\n"
                "CPU Scheduling is the process by which the OS short-term scheduler selects a process from the ready queue to execute on the CPU core.\n\n"
                "### ⚙️ Key Scheduling Policies\n"
                "- **FCFS**: Non-preemptive. Simple FIFO queue, but suffers from the **Convoy Effect** (short jobs blocked behind large jobs).\n"
                "- **SJF / SRTF**: Optimal for minimizing average waiting time, but future burst times are unpredictable.\n"
                "- **Round Robin (RR)**: Preemptive scheduling designed for time-sharing systems where each process receives a **Time Quantum ($q$)**. If $q$ is too small, high context-switching overhead harms performance; if too large, it degenerates to FCFS.\n"
                "- **Priority Scheduling**: Selects highest priority process; requires **Aging** to prevent starvation of low-priority tasks."
            )
        elif "synchronization" in q_lower or "semaphore" in q_lower or "mutex" in q_lower or "producer" in q_lower:
            return (
                "### 📌 Process Synchronization\n"
                "Process Synchronization coordinates concurrent processes accessing shared memory to prevent **Race Conditions**.\n\n"
                "### ⚙️ The Critical Section Problem\n"
                "Any solution must satisfy:\n"
                "1. **Mutual Exclusion**: Only one process in critical section at a time.\n"
                "2. **Progress**: Selection of next entering process cannot be postponed indefinitely.\n"
                "3. **Bounded Waiting**: Limits on how many times others can enter before a waiting process gets turn.\n\n"
                "### 🔑 Primitive Tools: Mutex vs. Semaphore\n"
                "- **Mutex**: Binary lock with strict ownership (only locking thread can unlock).\n"
                "- **Semaphore**: Integer variable modified atomically via `wait()` / `P()` and `signal()` / `V()`. Counting semaphores manage multi-unit resource pools."
            )
        else:
            # General synthesis from retrieved chunks
            snippets = " ".join([c.get("content", "")[:200] for c in retrieved_chunks[:2]])
            return (
                f"### 📌 Overview & Concept\n"
                f"Based on our course syllabus and lecture materials regarding **{question}**:\n\n"
                f"{snippets}\n\n"
                f"### ⚙️ Operating System Mechanics\n"
                f"- The OS manages hardware abstractions and resource multiplexing (CPU, Memory, I/O, Storage) while ensuring protection and high throughput.\n"
                f"- When dealing with this concept, user-mode applications interface with the kernel via privileged **System Calls** to ensure system stability.\n\n"
                f"### 💡 Next Steps for Revision\n"
                f"Review the associated lecture notes in the Course Knowledge Base, or test your understanding with **Exam Mode** MCQs and **AI Viva**!"
            )

    def evaluate_viva(
        self,
        topic: str,
        question: str,
        student_answer: str,
        history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        ans = student_answer.strip().lower()
        word_count = len(ans.split())

        # Determine points based on topic & concepts
        strengths = []
        missing = []
        score = 5.0
        next_q = None

        if "process" in question.lower() and "thread" in question.lower():
            if "address" in ans or "memory" in ans or "shared" in ans:
                strengths.append("Correctly explained memory address-space distinction")
                score += 1.5
            else:
                missing.append("Address-space sharing (threads share address space, processes have isolated spaces)")

            if "context switch" in ans or "overhead" in ans or "lightweight" in ans:
                strengths.append("Noted context switching overhead difference")
                score += 1.5
            else:
                missing.append("Context-switch overhead (threads are cheaper to switch)")

            if "tlb" in ans or "page table" in ans:
                strengths.append("Advanced detail: TLB flushing difference mentioned")
                score += 1.5
            else:
                missing.append("Hardware cache impact: TLB flushing required for processes but not threads")

            if word_count > 25:
                score += 0.5

            score = min(max(round(score, 1), 3.0), 9.5)
            if len(history) < 2:
                next_q = "Good. Now tell me why context switching between threads is generally cheaper than between processes at the hardware cache level?"
            elif len(history) < 4:
                next_q = "Why can two threads of the same process directly access the same global memory variables without IPC?"
            else:
                next_q = None

        elif "virtual memory" in question.lower() or "paging" in question.lower() or "tlb" in question.lower():
            if "page" in ans or "frame" in ans or "translation" in ans:
                strengths.append("Good understanding of logical-to-physical address translation")
                score += 2.0
            else:
                missing.append("Core mechanics of pages and physical frames")

            if "tlb" in ans or "cache" in ans or "hardware" in ans:
                strengths.append("Highlighted role of TLB hardware associative cache")
                score += 2.0
            else:
                missing.append("Role of TLB in reducing effective memory access time")

            score = min(max(round(score, 1), 3.5), 9.5)
            if len(history) < 2:
                next_q = "What happens when a CPU reference results in a Page Fault? Walk me through the OS kernel steps."
            else:
                next_q = None

        elif "deadlock" in question.lower():
            if "coffman" in ans or "mutual exclusion" in ans or "circular wait" in ans:
                strengths.append("Identified Coffman necessary conditions")
                score += 2.5
            else:
                missing.append("Specific Coffman conditions (Mutual exclusion, Hold & wait, No preemption, Circular wait)")

            if "banker" in ans or "safe state" in ans or "avoidance" in ans:
                strengths.append("Understood safe state and avoidance concept")
                score += 1.5
            else:
                missing.append("Distinction between Safe State and Unsafe State")

            score = min(max(round(score, 1), 4.0), 9.5)
            if len(history) < 2:
                next_q = "Can an unsafe state exist in a system without the system being currently deadlocked? Explain why."
            else:
                next_q = None

        else:
            if word_count > 20:
                strengths.append("Provided structured technical explanation")
                score += 2.0
            else:
                missing.append("Elaborate further with formal OS definitions and examples")
            score = min(max(round(score, 1), 5.0), 8.5)
            if len(history) < 2:
                next_q = "Can you describe a practical real-world scenario in modern operating systems where this arises?"
            else:
                next_q = None

        summary = f"Examiner evaluation complete. Scored {score}/10 based on conceptual completeness and key technical terminology."

        return {
            "score": score,
            "feedback_summary": summary,
            "strengths": strengths if strengths else ["Attempted direct response to examiner question"],
            "missing_points": missing if missing else ["Mention specific OS data structures (e.g. PCB, MMU registers) for higher rigor"],
            "next_question": next_q,
            "is_completed": next_q is None
        }

llm_service = LLMService()
