"""
Seed Database with OS Topics, Question Bank, Documents and Initial Student Progress
"""
import os
import sys

from database import SessionLocal, Base, engine
from models import User, Topic, Question, Document, TopicProgress, Attempt, VivaSession, init_db
from services.rag import DATA_DIR

TOPICS_DATA = [
    {
        "name": "CPU Scheduling",
        "module": "Module 2",
        "description": "Process states, scheduling metrics, FCFS, SJF, SRTF, Round Robin, and Priority scheduling."
    },
    {
        "name": "Process Synchronization",
        "module": "Module 3",
        "description": "Critical section problem, mutexes, counting and binary semaphores, Producer-Consumer, Dining Philosophers."
    },
    {
        "name": "Deadlocks",
        "module": "Module 4",
        "description": "Coffman conditions, Resource-Allocation Graphs, Banker's Algorithm for deadlock avoidance, detection & recovery."
    },
    {
        "name": "Memory Management",
        "module": "Module 5",
        "description": "Paging, segmentation, TLB, virtual memory, demand paging, and page replacement algorithms (FIFO, LRU, Optimal)."
    },
    {
        "name": "File Systems & I/O",
        "module": "Module 6",
        "description": "File concepts, directory structures, contiguous/indexed allocation, disk scheduling algorithms (SSTF, SCAN, LOOK)."
    }
]

QUESTIONS_DATA = [
    # Memory Management
    {
        "topic": "Memory Management",
        "difficulty": "Medium",
        "subconcept": "TLB",
        "question": "Which of the following hardware mechanisms is used to reduce address translation time during paging?",
        "options": ["Page Table Base Register", "Translation Lookaside Buffer (TLB)", "Cache Controller", "Direct Memory Access (DMA)"],
        "answer": "B",
        "explanation": "A Translation Lookaside Buffer (TLB) is a fast associative hardware cache that stores recently accessed virtual-to-physical address mappings, avoiding an extra main memory lookup on hit."
    },
    {
        "topic": "Memory Management",
        "difficulty": "Easy",
        "subconcept": "Paging",
        "question": "What is the primary benefit of paging over contiguous memory allocation?",
        "options": ["Eliminates external fragmentation", "Eliminates internal fragmentation", "Decreases page table size", "Eliminates need for MMU"],
        "answer": "A",
        "explanation": "Paging allows physical memory to be allocated non-contiguously in fixed-size frames, entirely eliminating external fragmentation, though it can still suffer from small internal fragmentation on the last page."
    },
    {
        "topic": "Memory Management",
        "difficulty": "Medium",
        "subconcept": "Page Replacement",
        "question": "Belady's Anomaly describes a phenomenon where:",
        "options": ["Page fault rate increases as more frames are allocated to a process", "Memory usage drops unexpectedly during execution", "Optimal page replacement performs worse than LRU", "A process enters a deadlock state during swapping"],
        "answer": "A",
        "explanation": "Belady's anomaly occurs in FIFO page replacement, where giving more physical page frames to a process can paradoxically increase the number of page faults."
    },
    {
        "topic": "Memory Management",
        "difficulty": "Hard",
        "subconcept": "Virtual Memory",
        "question": "Thrashing in a multi-programming system occurs when:",
        "options": ["CPU utilization reaches 100% due to compute-bound tasks", "A process spends more time paging than executing instructions", "Cache memory size exceeds physical RAM capacity", "Two threads access the same memory location simultaneously"],
        "answer": "B",
        "explanation": "Thrashing occurs when the sum of process working sets exceeds total physical memory, causing continuous page faults and near-zero CPU utilization as the system continuously swaps pages."
    },
    {
        "topic": "Memory Management",
        "difficulty": "Medium",
        "subconcept": "Page Replacement",
        "question": "Which page replacement algorithm is provably optimal for minimizing the total number of page faults?",
        "options": ["FIFO", "Least Recently Used (LRU)", "Optimal (OPT / MIN)", "Second-Chance Clock"],
        "answer": "C",
        "explanation": "Optimal page replacement replaces the page that will not be used for the longest period in the future. While impossible to implement in practice without future knowledge, it serves as a theoretical benchmark."
    },

    # CPU Scheduling
    {
        "topic": "CPU Scheduling",
        "difficulty": "Easy",
        "subconcept": "FCFS",
        "question": "The 'Convoy Effect' is a known drawback of which CPU scheduling algorithm?",
        "options": ["Round Robin", "First-Come, First-Served (FCFS)", "Shortest Job First (SJF)", "Priority Scheduling"],
        "answer": "B",
        "explanation": "In FCFS, when a long CPU-burst process holds the CPU, all subsequent shorter I/O-bound processes are blocked waiting behind it, causing the Convoy Effect and degrading system throughput."
    },
    {
        "topic": "CPU Scheduling",
        "difficulty": "Medium",
        "subconcept": "Round Robin",
        "question": "In Round Robin scheduling, what happens if the time quantum is chosen to be extremely large?",
        "options": ["It behaves identically to Shortest Remaining Time First", "It behaves like First-Come, First-Served (FCFS)", "Context-switching overhead increases drastically", "Deadlocks will occur frequently in user processes"],
        "answer": "B",
        "explanation": "If the time quantum exceeds the longest CPU burst among ready processes, each process will complete its burst before the quantum expires, degenerating into FCFS."
    },
    {
        "topic": "CPU Scheduling",
        "difficulty": "Medium",
        "subconcept": "SJF",
        "question": "Which CPU scheduling algorithm is provably optimal for minimizing the average waiting time of a given set of processes?",
        "options": ["Priority Scheduling", "Round Robin", "Shortest Job First (SJF)", "Multilevel Feedback Queue"],
        "answer": "C",
        "explanation": "By scheduling the process with the shortest burst time first, the waiting time for all subsequent processes is minimized, proving SJF optimal for average waiting time."
    },
    {
        "topic": "CPU Scheduling",
        "difficulty": "Hard",
        "subconcept": "Priority Scheduling",
        "question": "Which technique is used to prevent starvation (indefinite blocking) of low-priority processes in Priority Scheduling?",
        "options": ["Preemption", "Aging", "Compaction", "Context-switch throttling"],
        "answer": "B",
        "explanation": "Aging gradually increments the priority of processes that wait in the ready queue for prolonged durations, ensuring that even low-priority processes eventually get executed."
    },

    # Process Synchronization
    {
        "topic": "Process Synchronization",
        "difficulty": "Medium",
        "subconcept": "Critical Section",
        "question": "Which of the following is NOT one of the three mandatory criteria for solving the Critical Section problem?",
        "options": ["Mutual Exclusion", "Progress", "Bounded Waiting", "Priority Inheritance"],
        "answer": "D",
        "explanation": "The 3 classical criteria defined for any valid critical section solution are Mutual Exclusion, Progress, and Bounded Waiting. Priority inheritance is a specific technique for resolving priority inversion."
    },
    {
        "topic": "Process Synchronization",
        "difficulty": "Easy",
        "subconcept": "Semaphores",
        "question": "What is the atomic operation of wait(S) (or P(S)) on a semaphore?",
        "options": ["Increments S and awakens a blocked process", "Decrements S; if S < 0, blocks the invoking process", "Sets S to 0 unconditionally", "Swaps S with a temporary register"],
        "answer": "B",
        "explanation": "The wait(S) operation decrements the semaphore value. If the value becomes negative, the executing process is suspended and placed in the semaphore wait queue."
    },
    {
        "topic": "Process Synchronization",
        "difficulty": "Hard",
        "subconcept": "Dining Philosophers",
        "question": "In the Dining Philosophers problem, what condition causes a system-wide deadlock?",
        "options": ["Philosophers eat sequentially", "All philosophers pick up their left chopstick at the same instant", "A philosopher drops a chopstick while eating", "More than 5 philosophers sit at the table"],
        "answer": "B",
        "explanation": "If all five philosophers simultaneously pick up their left chopsticks, every philosopher holds one chopstick and is blocked waiting for the right chopstick, creating a circular wait and deadlock."
    },
    {
        "topic": "Process Synchronization",
        "difficulty": "Medium",
        "subconcept": "Producer-Consumer",
        "question": "In the Bounded-Buffer Producer-Consumer problem with buffer size N, what initial value should the 'empty' semaphore have?",
        "options": ["0", "1", "N", "Infinity"],
        "answer": "C",
        "explanation": "The 'empty' counting semaphore tracks how many unfilled slots remain in the buffer, so it is initialized to the maximum buffer capacity N."
    },

    # Deadlocks
    {
        "topic": "Deadlocks",
        "difficulty": "Easy",
        "subconcept": "Coffman Conditions",
        "question": "Which of the following is NOT one of the four Coffman conditions necessary for deadlock?",
        "options": ["Mutual Exclusion", "Hold and Wait", "Preemption of resources", "Circular Wait"],
        "answer": "C",
        "explanation": "The condition is NO preemption. If resources can be freely preempted by the OS kernel, deadlocks cannot persist."
    },
    {
        "topic": "Deadlocks",
        "difficulty": "Medium",
        "subconcept": "Banker's Algorithm",
        "question": "In Banker's Algorithm, if a system is currently in an UNSAFE state, this implies that:",
        "options": ["A deadlock has definitely occurred right now", "A deadlock cannot possibly occur", "The system has a risk of deadlocking depending on future requests", "All processes must be immediately aborted"],
        "answer": "C",
        "explanation": "An unsafe state is not necessarily a deadlocked state; it simply means the operating system cannot guarantee that all processes will be able to finish if they demand their maximum declared resources."
    },
    {
        "topic": "Deadlocks",
        "difficulty": "Hard",
        "subconcept": "Resource Allocation Graph",
        "question": "In a Resource-Allocation Graph where each resource type has ONLY ONE instance, the presence of a cycle:",
        "options": ["Is a necessary but NOT sufficient condition for deadlock", "Is both a necessary AND sufficient condition for deadlock", "Guarantees no deadlock exists", "Indicates high CPU utilization"],
        "answer": "B",
        "explanation": "When all resource types have only a single instance, a cycle in the resource allocation graph is both necessary and sufficient for deadlock. With multiple instances, a cycle is only necessary, not sufficient."
    },

    # File Systems
    {
        "topic": "File Systems & I/O",
        "difficulty": "Medium",
        "subconcept": "Disk Scheduling",
        "question": "Which disk scheduling algorithm services requests by moving the arm in one direction to the end and immediately reversing direction?",
        "options": ["FCFS", "SSTF", "SCAN (Elevator algorithm)", "C-SCAN"],
        "answer": "C",
        "explanation": "The SCAN algorithm (also known as the elevator algorithm) sweeps the disk head from one end of the disk toward the other, servicing requests along the way, and reverses direction when reaching the disk edge."
    },
    {
        "topic": "File Systems & I/O",
        "difficulty": "Easy",
        "subconcept": "File Allocation",
        "question": "Which file allocation method provides fast direct/random access to arbitrary blocks without external fragmentation?",
        "options": ["Contiguous allocation", "Linked allocation", "Indexed allocation", "Sequential tape allocation"],
        "answer": "C",
        "explanation": "Indexed allocation brings all pointers together into an index block for each file, supporting direct random access without suffering from external fragmentation."
    }
]

def seed_all():
    init_db()
    db = SessionLocal()
    try:
        # 1. Seed Topics
        topic_map = {}
        for t_info in TOPICS_DATA:
            t = db.query(Topic).filter(Topic.name == t_info["name"]).first()
            if not t:
                t = Topic(name=t_info["name"], module=t_info["module"], description=t_info["description"])
                db.add(t)
                db.commit()
                db.refresh(t)
            topic_map[t_info["name"]] = t

        # 2. Seed Questions
        q_count = 0
        for q_info in QUESTIONS_DATA:
            topic_obj = topic_map.get(q_info["topic"])
            if not topic_obj:
                continue
            existing = db.query(Question).filter(Question.question == q_info["question"]).first()
            if not existing:
                q = Question(
                    topic_id=topic_obj.id,
                    difficulty=q_info["difficulty"],
                    question=q_info["question"],
                    options=q_info["options"],
                    answer=q_info["answer"],
                    explanation=q_info["explanation"],
                    subconcept=q_info["subconcept"]
                )
                db.add(q)
                q_count += 1
        db.commit()

        # 3. Ingest Documents into DB
        doc_count = 0
        if os.path.exists(DATA_DIR):
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
                            doc_count += 1
            db.commit()

        # 4. Ensure distinct test students exist with different stats
        # Student 1: Abhinav (Existing student with progress)
        user_abhinav = db.query(User).filter(User.email == "abhijain4554@gmail.com").first()
        if not user_abhinav:
            user_abhinav = User(name="abhinav", email="abhijain4554@gmail.com")
            db.add(user_abhinav)
            db.commit()
            db.refresh(user_abhinav)

        # Student 2: Tanya Sharma (High performer, weak in Deadlocks)
        user_tanya = db.query(User).filter(User.email == "tanya.sharma@example.com").first()
        if not user_tanya:
            user_tanya = User(name="Tanya Sharma", email="tanya.sharma@example.com")
            db.add(user_tanya)
            db.commit()
            db.refresh(user_tanya)

        # Student 3: Rahul Verma (New student, 0 attempts)
        user_rahul = db.query(User).filter(User.email == "rahul.verma@example.com").first()
        if not user_rahul:
            user_rahul = User(name="Rahul Verma", email="rahul.verma@example.com")
            db.add(user_rahul)
            db.commit()
            db.refresh(user_rahul)

        # Seed progress for Abhinav: Weakest = Process Synchronization (40%)
        abhinav_progress = [
            ("CPU Scheduling", 90.0, 10, 9),
            ("Deadlocks", 80.0, 5, 4),
            ("Memory Management", 55.0, 9, 5),
            ("Process Synchronization", 40.0, 10, 4),
            ("File Systems & I/O", 70.0, 7, 5),
        ]
        for top_name, acc, att, corr in abhinav_progress:
            t = topic_map.get(top_name)
            if t:
                prog = db.query(TopicProgress).filter(
                    TopicProgress.user_id == user_abhinav.id,
                    TopicProgress.topic_id == t.id
                ).first()
                if not prog:
                    prog = TopicProgress(
                        user_id=user_abhinav.id,
                        topic_id=t.id,
                        accuracy=acc,
                        attempts_count=att,
                        correct_count=corr
                    )
                    db.add(prog)

        # Seed progress for Tanya: Weakest = Deadlocks (45%), Strong in Synchronization (85%)
        tanya_progress = [
            ("CPU Scheduling", 85.0, 8, 7),
            ("Deadlocks", 45.0, 6, 3),
            ("Memory Management", 90.0, 10, 9),
            ("Process Synchronization", 85.0, 8, 7),
            ("File Systems & I/O", 80.0, 5, 4),
        ]
        for top_name, acc, att, corr in tanya_progress:
            t = topic_map.get(top_name)
            if t:
                prog = db.query(TopicProgress).filter(
                    TopicProgress.user_id == user_tanya.id,
                    TopicProgress.topic_id == t.id
                ).first()
                if not prog:
                    prog = TopicProgress(
                        user_id=user_tanya.id,
                        topic_id=t.id,
                        accuracy=acc,
                        attempts_count=att,
                        correct_count=corr
                    )
                    db.add(prog)

        # Ensure Abhinav has some attempts and vivas in DB
        if db.query(Attempt).filter(Attempt.user_id == user_abhinav.id).count() == 0:
            first_q = db.query(Question).first()
            if first_q:
                db.add(Attempt(user_id=user_abhinav.id, question_id=first_q.id, selected_option="B", is_correct=True, score=1.0))
                db.add(Attempt(user_id=user_abhinav.id, question_id=first_q.id, selected_option="A", is_correct=False, score=0.0))
        
        if db.query(VivaSession).filter(VivaSession.user_id == user_abhinav.id).count() == 0:
            db.add(VivaSession(user_id=user_abhinav.id, topic="Process Management & CPU Scheduling", score=8.5, conversation=[], feedback={}))

        # Tanya's attempts
        if db.query(Attempt).filter(Attempt.user_id == user_tanya.id).count() == 0:
            first_q = db.query(Question).first()
            if first_q:
                db.add(Attempt(user_id=user_tanya.id, question_id=first_q.id, selected_option="B", is_correct=True, score=1.0))

        db.commit()
        print(f"Seed finished: {len(topic_map)} topics, {q_count} new questions, {doc_count} documents.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
