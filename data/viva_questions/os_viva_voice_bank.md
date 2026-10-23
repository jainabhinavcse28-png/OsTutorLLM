# Operating Systems Viva Voce Question Bank

## Topic 1: Process Management & CPU Scheduling
- **Q1**: What is the difference between a process and a thread?
  - **Key Points Expected**:
    - Process has its own address space, PCB, open files, heavy context switch overhead.
    - Thread shares code, data, heap with peer threads in same process; private registers and stack.
    - Thread context switch is much lighter because no TLB/page directory flush is needed.
- **Q2**: Why is thread context switching faster than process context switching?
  - **Key Points Expected**: Memory address space is not switched; TLB cache entries remain valid; only CPU registers, program counter, and stack pointer need to be swapped.
- **Q3**: What is the Convoy Effect and which scheduling algorithm suffers from it?
  - **Key Points Expected**: Occurs in FCFS when smaller CPU-burst processes are delayed behind a massive compute-bound process.

## Topic 2: Process Synchronization
- **Q4**: What is a critical section? Name the three conditions required for a valid solution.
  - **Key Points Expected**: Code segment accessing shared variables. 3 conditions: Mutual Exclusion, Progress, Bounded Waiting.
- **Q5**: What is the difference between a mutex and a binary semaphore?
  - **Key Points Expected**: Mutex has ownership (only locking thread can unlock); binary semaphore is a signaling mechanism that can be signaled by any thread.
- **Q6**: Explain how the Producer-Consumer problem avoids race conditions using semaphores.
  - **Key Points Expected**: Uses `mutex` for buffer exclusivity, `empty` to count available slots, `full` to count populated items.

## Topic 3: Deadlocks
- **Q7**: What are the four necessary Coffman conditions for a deadlock?
  - **Key Points Expected**: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.
- **Q8**: What is the difference between a safe state and a deadlock-free state?
  - **Key Points Expected**: A safe state guarantees that a sequence exists to complete all processes without deadlock. An unsafe state is not necessarily deadlocked yet, but may transition into one.

## Topic 4: Memory Management & Virtual Memory
- **Q9**: What is the difference between internal and external fragmentation?
  - **Key Points Expected**: Internal: allocated space larger than requested inside partition/page. External: total free space sufficient but non-contiguous.
- **Q10**: What is a TLB and why is it used?
  - **Key Points Expected**: Translation Lookaside Buffer; fast hardware associative cache storing recent virtual-to-physical page frame translations to eliminate extra memory lookups.
- **Q11**: What is Belady's Anomaly?
  - **Key Points Expected**: The phenomenon where increasing the number of allocated physical frames increases the number of page faults under FIFO page replacement.
- **Q12**: What is Thrashing and how does an OS resolve it?
  - **Key Points Expected**: High paging activity where CPU spends more time swapping pages than executing instructions. Solved via Working Set Model, Page Fault Frequency (PFF) control, or suspending processes.
