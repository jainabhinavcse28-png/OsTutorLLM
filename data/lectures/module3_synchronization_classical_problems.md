# Lecture Notes: Module 3 — Process Synchronization & Classical Problems

## 1. The Critical-Section Problem
A race condition occurs when multiple processes access and manipulate shared data concurrently and the outcome depends on the particular order of execution.
Any valid solution to the critical-section problem must satisfy three requirements:
1. **Mutual Exclusion**: If process \(P_i\) is executing in its critical section, no other processes can be executing in their critical sections.
2. **Progress**: If no process is executing in its critical section and some processes wish to enter, only those processes not in their remainder sections can participate in deciding who enters next, and this selection cannot be postponed indefinitely.
3. **Bounded Waiting**: There must be a bound on the number of times other processes are allowed to enter their critical sections after a process has made a request to enter.

## 2. Mutex Locks & Semaphores
- **Mutex Lock**: A boolean lock variable. Processes acquire lock before critical section and release it upon exit.
- **Semaphore**: An integer variable accessed only through two atomic operations:
  - `wait(S)` or `P(S)`: Decrements \(S\). If \(S < 0\), the process blocks.
  - `signal(S)` or `V(S)`: Increments \(S\). If \(S \le 0\), awakens a blocked process.
- **Counting Semaphore**: Value can range over an unrestricted integer domain (useful for managing access to a finite resource with multiple instances).
- **Binary Semaphore**: Value can range only between 0 and 1 (functions identically to a mutex lock).

## 3. Classic Synchronization Problems
### A. The Producer-Consumer Problem (Bounded-Buffer)
- A producer produces items into a buffer of size \(N\); a consumer consumes them.
- Uses three semaphores:
  - `mutex` initialized to 1 (mutual exclusion for buffer access).
  - `empty` initialized to \(N\) (counts empty buffer slots).
  - `full` initialized to 0 (counts filled buffer slots).
- Producer executes: `wait(empty); wait(mutex); /* produce */ signal(mutex); signal(full);`
- Consumer executes: `wait(full); wait(mutex); /* consume */ signal(mutex); signal(empty);`

### B. The Dining Philosophers Problem
- 5 philosophers sit around a circular table with 5 chopsticks. Each philosopher alternates between thinking and eating. A philosopher needs both adjacent chopsticks (left and right) to eat.
- If all 5 philosophers simultaneously pick up their left chopstick, a circular wait occurs, resulting in **deadlock**.
- Solutions:
  1. Allow at most 4 philosophers to sit at the table simultaneously.
  2. Allow a philosopher to pick up chopsticks only if both are available (atomic pickup).
  3. Use an asymmetric solution: an odd philosopher picks up left first, then right; an even philosopher picks up right first, then left.
