# Operating Systems Laboratory Manual: Practical Experiments

## Experiment 1: CPU Scheduling Algorithms (FCFS, SJF, SRTF, Round Robin, Priority)
- **Objective**: Implement and evaluate CPU scheduling policies in C/Python to calculate Average Turnaround Time (TAT) and Average Waiting Time (WT).
- **Formulas**:
  - Turnaround Time = Completion Time - Arrival Time
  - Waiting Time = Turnaround Time - Burst Time
- **Gantt Chart Representation**: Timeline visualization from time 0 to max completion time displaying context switch boundaries.

## Experiment 2: Deadlock Avoidance using Banker's Algorithm
- **Objective**: Implement Banker's Algorithm to check if a system is in a safe state and find safe process execution sequences.
- **Inputs**: Number of processes \(N\), number of resources \(M\), Allocation matrix, Max matrix, Available vector.
- **Output**: Need matrix calculation, determination of Safe vs. Unsafe state, and safe sequence printout.

## Experiment 3: Page Replacement Algorithms (FIFO, LRU, Optimal)
- **Objective**: Simulate FIFO, LRU, and Optimal page replacement schemes for a given page reference string and frame capacity.
- **Evaluation**: Count Total Page Faults and Total Page Hits; compute Hit Ratio (\(Hits / Total \times 100\%\)) and Fault Ratio (\(Faults / Total \times 100\%\)).
- **Observations**: Test Belady's Anomaly using FIFO with reference string: `1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5` with 3 frames vs. 4 frames.

## Experiment 4: Inter-Process Communication & Synchronization
- **Objective**: Implement Producer-Consumer problem using POSIX semaphores (`sem_init`, `sem_wait`, `sem_post`) and mutex locks (`pthread_mutex_lock`).
