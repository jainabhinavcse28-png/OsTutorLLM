# Lecture Notes: Module 2 — Process Management & CPU Scheduling

## 1. Process Concept and PCB
A process is a program in execution. Unlike a passive program stored on disk, a process is an active entity with a program counter (PC), CPU registers, stack, data section, and heap.
The **Process Control Block (PCB)** stores:
- Process state (New, Ready, Running, Waiting, Terminated)
- Program counter & CPU registers
- CPU-scheduling information (priority, scheduling queue pointers)
- Memory-management information (base/limit registers or page tables)
- Accounting information and I/O status information

## 2. Processes vs. Threads
- A **process** is an isolated execution environment with its own dedicated virtual address space, file descriptors, and security tokens. Creating or context switching between processes incurs high overhead because page tables and TLB entries must be flushed.
- A **thread** is a lightweight unit of CPU execution within a process. Multiple threads of the same process share the same code section, data section (global variables), and OS resources (such as open files), but maintain private program counters, registers, and call stacks.
- Why context switching between threads is cheaper: Since threads share the same address space, thread context switches do not require flushing the TLB or swapping memory page directories, saving significant CPU clock cycles.

## 3. CPU Scheduling Metrics
- **Turnaround Time (TAT)**: The interval from the time of submission of a process to the time of completion. \( TAT = Completion\_Time - Arrival\_Time \).
- **Waiting Time (WT)**: The sum of the periods spent waiting in the ready queue. \( WT = Turnaround\_Time - Burst\_Time \).
- **Response Time**: Time from submission until the first response is produced.
- **Throughput**: Number of processes completed per unit time.
- **CPU Utilization**: Percentage of time the CPU is busy executing user/system tasks.

## 4. Scheduling Algorithms
- **First-Come, First-Served (FCFS)**: Non-preemptive. Suffers from the *Convoy Effect* where short processes wait behind a long CPU-burst process.
- **Shortest-Job-First (SJF)**: Provably optimal for minimizing average waiting time. Difficult to implement practically because future CPU burst lengths cannot be known in advance.
- **Shortest Remaining Time First (SRTF)**: Preemptive version of SJF. Preempts the running process if a newly arrived process has a shorter remaining burst time.
- **Round Robin (RR)**: Designed for time-sharing systems. Each process gets a small unit of CPU time (time quantum \(q\)). If \(q\) is very large, RR behaves like FCFS. If \(q\) is extremely small, high context-switching overhead degrades system throughput.
- **Priority Scheduling**: Can be preemptive or non-preemptive. Suffers from *starvation* (indefinite blocking of low-priority processes). Solution is *aging* (gradually increasing the priority of processes that wait in the system for a long time).
