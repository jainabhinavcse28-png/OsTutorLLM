# Operating Systems Course Syllabus & Learning Outcomes

## Course Overview
Operating Systems (CS301 / CS401) is a core computer science course introducing the fundamental concepts, mechanisms, and design trade-offs in modern multi-programmed and multi-tasking operating systems.

## Module Breakdown

### Module 1: Introduction to Operating Systems & System Calls
- Functions of OS, System structures, Dual-mode operation (User mode vs. Kernel mode).
- System Calls: fork(), exec(), wait(), exit(), read(), write(), open(), close().
- OS Architectures: Monolithic kernels, Microkernels, Layered systems, Hybrid kernels.

### Module 2: Process Management & CPU Scheduling
- Process Control Block (PCB), Process states (New, Ready, Running, Waiting, Terminated).
- Threads: User threads vs. Kernel threads, Many-to-one, One-to-one, Many-to-many models.
- Context switching overhead and mechanisms.
- CPU Scheduling algorithms: FCFS, SJF, SRTF, Round Robin, Priority, Multilevel Queue Scheduling.
- Scheduling criteria: CPU utilization, Throughput, Turnaround time, Waiting time, Response time.

### Module 3: Inter-Process Communication & Process Synchronization
- Race conditions, Critical section problem, Requirements (Mutual exclusion, Progress, Bounded waiting).
- Synchronization hardware: Test-and-Set, Compare-and-Swap.
- Mutex locks, Counting and Binary Semaphores, Wait() and Signal() operations.
- Classic synchronization problems: Producer-Consumer (Bounded buffer), Readers-Writers, Dining Philosophers.
- Monitors: Condition variables, wait() and signal() semantics.

### Module 4: Deadlocks & Handling Strategies
- Deadlock characterization: 4 Coffman conditions (Mutual exclusion, Hold and wait, No preemption, Circular wait).
- Resource-Allocation Graph (RAG) and cycle detection.
- Deadlock prevention and avoidance: Safe state definition, Banker's Algorithm (Safety algorithm & Resource-request algorithm).
- Deadlock detection and recovery methods (Process termination, Resource preemption).

### Module 5: Memory Management & Virtual Memory
- Contiguous memory allocation: First-fit, Best-fit, Worst-fit, Internal & External fragmentation.
- Paging: Logical to physical address translation, Page table, Frame table.
- Translation Lookaside Buffer (TLB): TLB hit/miss, Effective Memory Access Time (EMAT).
- Virtual Memory: Demand paging, Page fault handling routine.
- Page Replacement Algorithms: FIFO, Optimal (Belady's anomaly), LRU (Least Recently Used), Clock algorithm.
- Thrashing: Working-set model, Page fault frequency.

### Module 6: Storage Systems & File Systems
- File concept, Directory structures, File allocation methods (Contiguous, Linked, Indexed).
- Free space management: Bitmaps, Linked lists.
- Disk Scheduling algorithms: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK.
