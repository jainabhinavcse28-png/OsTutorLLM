# Lecture Notes: Module 4 — Deadlocks & Banker's Algorithm

## 1. Deadlock Characterization
A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process in the set.
A deadlock can arise if and only if the following four **Coffman conditions** hold simultaneously:
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process must be holding at least one resource and waiting to acquire additional resources held by other processes.
3. **No Preemption**: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it after that process has completed its task.
4. **Circular Wait**: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain (\(P_0 \to P_1 \to \dots \to P_n \to P_0\)).

## 2. Deadlock Handling Methods
- **Deadlock Prevention**: Invalidate at least one of the 4 Coffman conditions (e.g. impose a total ordering of all resource types to prevent Circular Wait).
- **Deadlock Avoidance**: Ensure the system will never enter an unsafe state by having processes declare their maximum resource demands a priori (Banker's Algorithm).
- **Deadlock Detection & Recovery**: Allow the system to enter a deadlocked state, detect it, and recover (e.g., aborting processes or preempting resources).
- **Ostrich Algorithm**: Ignore the problem altogether (commonly adopted by UNIX and Windows for general application deadlocks).

## 3. Banker's Algorithm
Developed by Edsger Dijkstra for resource allocation in operating systems with multiple instances of each resource type.
- **Data Structures**:
  - `Available[m]`: Vector of length \(m\). If \(Available[j] = k\), there are \(k\) instances of resource \(R_j\) available.
  - `Max[n][m]`: \(n \times m\) matrix. If \(Max[i][j] = k\), process \(P_i\) may request at most \(k\) instances of resource \(R_j\).
  - `Allocation[n][m]`: \(n \times m\) matrix. Number of resources of each type currently allocated to each process.
  - `Need[n][m]`: Remaining resource need of each process: \( Need[i][j] = Max[i][j] - Allocation[i][j] \).

- **Safety Algorithm**:
  1. Let `Work = Available` and `Finish[i] = False` for all \(i\).
  2. Find an index \(i\) such that `Finish[i] == False` and `Need[i] <= Work`.
     If no such \(i\) exists, go to step 4.
  3. `Work = Work + Allocation[i]`, `Finish[i] = True`. Go to step 2.
  4. If `Finish[i] == True` for all \(i\), then the system is in a **Safe State**; the sequence of processes is a **Safe Sequence**. Otherwise, the system is in an **Unsafe State**.
