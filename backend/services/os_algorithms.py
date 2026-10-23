from typing import List, Dict, Any, Optional

class CPUScheduler:
    @staticmethod
    def run_fcfs(processes: List[Dict[str, Any]]) -> Dict[str, Any]:
        # Sort by arrival time
        sorted_procs = sorted(processes, key=lambda p: (p["arrival_time"], p["pid"]))
        current_time = 0
        gantt_chart = []
        table = []
        total_wt = 0
        total_tat = 0
        busy_time = 0

        for p in sorted_procs:
            at = p["arrival_time"]
            bt = p["burst_time"]
            if current_time < at:
                current_time = at
            start = current_time
            end = start + bt
            current_time = end
            busy_time += bt

            gantt_chart.append({"pid": p["pid"], "start": start, "end": end})
            ct = end
            tat = ct - at
            wt = tat - bt
            total_tat += tat
            total_wt += wt

            table.append({
                "pid": p["pid"],
                "arrival_time": at,
                "burst_time": bt,
                "completion_time": ct,
                "turnaround_time": tat,
                "waiting_time": wt
            })

        n = max(len(table), 1)
        total_span = current_time if current_time > 0 else 1
        cpu_util = round((busy_time / total_span) * 100, 2)

        return {
            "algorithm": "FCFS",
            "gantt_chart": gantt_chart,
            "process_table": table,
            "avg_turnaround_time": round(total_tat / n, 2),
            "avg_waiting_time": round(total_wt / n, 2),
            "cpu_utilization": cpu_util
        }

    @staticmethod
    def run_sjf(processes: List[Dict[str, Any]]) -> Dict[str, Any]:
        # Non-preemptive Shortest Job First
        procs = sorted(processes, key=lambda p: (p["arrival_time"], p["burst_time"]))
        n = len(procs)
        completed = 0
        current_time = 0
        visited = [False] * n
        gantt_chart = []
        table = []
        total_wt = 0
        total_tat = 0
        busy_time = 0

        while completed < n:
            # Find available process with shortest burst time
            candidates = [
                (i, procs[i]) for i in range(n)
                if not visited[i] and procs[i]["arrival_time"] <= current_time
            ]

            if not candidates:
                # Advance time to next arrival
                unvisited = [procs[i]["arrival_time"] for i in range(n) if not visited[i]]
                current_time = min(unvisited)
                continue

            # Pick minimum burst time
            idx, p = min(candidates, key=lambda item: item[1]["burst_time"])
            visited[idx] = True
            completed += 1

            start = current_time
            end = start + p["burst_time"]
            current_time = end
            busy_time += p["burst_time"]

            gantt_chart.append({"pid": p["pid"], "start": start, "end": end})
            ct = end
            tat = ct - p["arrival_time"]
            wt = tat - p["burst_time"]
            total_tat += tat
            total_wt += wt

            table.append({
                "pid": p["pid"],
                "arrival_time": p["arrival_time"],
                "burst_time": p["burst_time"],
                "completion_time": ct,
                "turnaround_time": tat,
                "waiting_time": wt
            })

        table.sort(key=lambda x: x["pid"])
        total_span = current_time if current_time > 0 else 1
        return {
            "algorithm": "SJF (Non-Preemptive)",
            "gantt_chart": gantt_chart,
            "process_table": table,
            "avg_turnaround_time": round(total_tat / max(n, 1), 2),
            "avg_waiting_time": round(total_wt / max(n, 1), 2),
            "cpu_utilization": round((busy_time / total_span) * 100, 2)
        }

    @staticmethod
    def run_srtf(processes: List[Dict[str, Any]]) -> Dict[str, Any]:
        # Preemptive Shortest Remaining Time First
        n = len(processes)
        rem_bt = {p["pid"]: p["burst_time"] for p in processes}
        at_dict = {p["pid"]: p["arrival_time"] for p in processes}
        orig_bt = {p["pid"]: p["burst_time"] for p in processes}
        
        current_time = 0
        completed = 0
        gantt_raw = []
        completion_time = {}
        busy_time = 0

        min_arr = min(p["arrival_time"] for p in processes) if processes else 0
        current_time = min_arr

        while completed < n:
            available = [
                p for p in processes
                if at_dict[p["pid"]] <= current_time and rem_bt[p["pid"]] > 0
            ]

            if not available:
                unf = [at_dict[p["pid"]] for p in processes if rem_bt[p["pid"]] > 0]
                current_time = min(unf)
                continue

            # Pick process with smallest remaining time
            chosen = min(available, key=lambda p: (rem_bt[p["pid"]], at_dict[p["pid"]]))
            pid = chosen["pid"]

            # Run 1 time unit
            start = current_time
            current_time += 1
            rem_bt[pid] -= 1
            busy_time += 1
            gantt_raw.append({"pid": pid, "start": start, "end": current_time})

            if rem_bt[pid] == 0:
                completed += 1
                completion_time[pid] = current_time

        # Merge continuous gantt blocks
        gantt_chart = []
        for block in gantt_raw:
            if gantt_chart and gantt_chart[-1]["pid"] == block["pid"] and gantt_chart[-1]["end"] == block["start"]:
                gantt_chart[-1]["end"] = block["end"]
            else:
                gantt_chart.append(dict(block))

        table = []
        total_tat = 0
        total_wt = 0
        for p in processes:
            pid = p["pid"]
            at = p["arrival_time"]
            bt = orig_bt[pid]
            ct = completion_time[pid]
            tat = ct - at
            wt = tat - bt
            total_tat += tat
            total_wt += wt
            table.append({
                "pid": pid,
                "arrival_time": at,
                "burst_time": bt,
                "completion_time": ct,
                "turnaround_time": tat,
                "waiting_time": wt
            })

        table.sort(key=lambda x: x["pid"])
        total_span = current_time if current_time > 0 else 1
        return {
            "algorithm": "SRTF (Preemptive SJF)",
            "gantt_chart": gantt_chart,
            "process_table": table,
            "avg_turnaround_time": round(total_tat / max(n, 1), 2),
            "avg_waiting_time": round(total_wt / max(n, 1), 2),
            "cpu_utilization": round((busy_time / total_span) * 100, 2)
        }

    @staticmethod
    def run_round_robin(processes: List[Dict[str, Any]], quantum: int = 2) -> Dict[str, Any]:
        quantum = max(quantum, 1)
        sorted_procs = sorted(processes, key=lambda p: (p["arrival_time"], p["pid"]))
        n = len(sorted_procs)
        rem_bt = {p["pid"]: p["burst_time"] for p in sorted_procs}
        at_dict = {p["pid"]: p["arrival_time"] for p in sorted_procs}
        orig_bt = {p["pid"]: p["burst_time"] for p in sorted_procs}

        current_time = min(at_dict.values()) if at_dict else 0
        ready_queue = []
        in_queue = set()
        
        # Add processes arriving at current_time
        for p in sorted_procs:
            if p["arrival_time"] <= current_time:
                ready_queue.append(p["pid"])
                in_queue.add(p["pid"])

        gantt_chart = []
        completion_time = {}
        busy_time = 0

        while ready_queue or any(rem_bt[p["pid"]] > 0 for p in sorted_procs):
            if not ready_queue:
                # CPU idle, advance to next arriving process
                remaining = [p for p in sorted_procs if rem_bt[p["pid"]] > 0]
                next_arr = min(p["arrival_time"] for p in remaining)
                current_time = next_arr
                for p in sorted_procs:
                    if p["arrival_time"] <= current_time and rem_bt[p["pid"]] > 0 and p["pid"] not in in_queue:
                        ready_queue.append(p["pid"])
                        in_queue.add(p["pid"])
                continue

            pid = ready_queue.pop(0)
            in_queue.discard(pid)
            exec_time = min(rem_bt[pid], quantum)
            start = current_time
            end = start + exec_time
            current_time = end
            rem_bt[pid] -= exec_time
            busy_time += exec_time

            gantt_chart.append({"pid": pid, "start": start, "end": end})

            # Check new arrivals during this execution slice
            for p in sorted_procs:
                if (p["arrival_time"] <= current_time and 
                    rem_bt[p["pid"]] > 0 and 
                    p["pid"] != pid and 
                    p["pid"] not in ready_queue):
                    ready_queue.append(p["pid"])
                    in_queue.add(p["pid"])

            # If current process still has burst left, re-queue
            if rem_bt[pid] > 0:
                ready_queue.append(pid)
                in_queue.add(pid)
            else:
                completion_time[pid] = current_time

        table = []
        total_tat = 0
        total_wt = 0
        for p in sorted_procs:
            pid = p["pid"]
            at = p["arrival_time"]
            bt = orig_bt[pid]
            ct = completion_time[pid]
            tat = ct - at
            wt = tat - bt
            total_tat += tat
            total_wt += wt
            table.append({
                "pid": pid,
                "arrival_time": at,
                "burst_time": bt,
                "completion_time": ct,
                "turnaround_time": tat,
                "waiting_time": wt
            })

        table.sort(key=lambda x: x["pid"])
        total_span = current_time if current_time > 0 else 1
        return {
            "algorithm": f"Round Robin (Quantum={quantum})",
            "gantt_chart": gantt_chart,
            "process_table": table,
            "avg_turnaround_time": round(total_tat / max(n, 1), 2),
            "avg_waiting_time": round(total_wt / max(n, 1), 2),
            "cpu_utilization": round((busy_time / total_span) * 100, 2)
        }

    @staticmethod
    def run_priority(processes: List[Dict[str, Any]]) -> Dict[str, Any]:
        # Non-preemptive Priority (Lower number = Higher Priority)
        procs = sorted(processes, key=lambda p: (p["arrival_time"], p.get("priority", 0)))
        n = len(procs)
        completed = 0
        current_time = min(p["arrival_time"] for p in procs) if procs else 0
        visited = [False] * n
        gantt_chart = []
        table = []
        total_wt = 0
        total_tat = 0
        busy_time = 0

        while completed < n:
            candidates = [
                (i, procs[i]) for i in range(n)
                if not visited[i] and procs[i]["arrival_time"] <= current_time
            ]

            if not candidates:
                unvisited = [procs[i]["arrival_time"] for i in range(n) if not visited[i]]
                current_time = min(unvisited)
                continue

            idx, p = min(candidates, key=lambda item: item[1].get("priority", 0))
            visited[idx] = True
            completed += 1

            start = current_time
            end = start + p["burst_time"]
            current_time = end
            busy_time += p["burst_time"]

            gantt_chart.append({"pid": p["pid"], "start": start, "end": end})
            ct = end
            tat = ct - p["arrival_time"]
            wt = tat - p["burst_time"]
            total_tat += tat
            total_wt += wt

            table.append({
                "pid": p["pid"],
                "arrival_time": p["arrival_time"],
                "burst_time": p["burst_time"],
                "completion_time": ct,
                "turnaround_time": tat,
                "waiting_time": wt
            })

        table.sort(key=lambda x: x["pid"])
        total_span = current_time if current_time > 0 else 1
        return {
            "algorithm": "Priority (Non-Preemptive)",
            "gantt_chart": gantt_chart,
            "process_table": table,
            "avg_turnaround_time": round(total_tat / max(n, 1), 2),
            "avg_waiting_time": round(total_wt / max(n, 1), 2),
            "cpu_utilization": round((busy_time / total_span) * 100, 2)
        }


class BankersAlgorithm:
    @staticmethod
    def evaluate(
        processes: List[str],
        resources: List[str],
        allocation: List[List[int]],
        max_matrix: List[List[int]],
        available: List[int],
        request_process: Optional[str] = None,
        request_vector: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        num_p = len(processes)
        num_r = len(resources)
        trace = []

        # 1. Calculate Need Matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
        need = []
        for i in range(num_p):
            row = []
            for j in range(num_r):
                val = max_matrix[i][j] - allocation[i][j]
                if val < 0:
                    val = 0
                row.append(val)
            need.append(row)

        trace.append("Calculated Need Matrix = Max - Allocation.")

        # Check resource request if provided
        alloc_copy = [row[:] for row in allocation]
        avail_copy = available[:]
        need_copy = [row[:] for row in need]

        if request_process and request_vector:
            if request_process not in processes:
                return {
                    "is_safe": False,
                    "need_matrix": need,
                    "safe_sequence": [],
                    "trace": trace,
                    "message": f"Process {request_process} does not exist."
                }
            p_idx = processes.index(request_process)
            trace.append(f"Processing Resource Request for {request_process}: {request_vector}")

            # Condition 1: Request <= Need
            for j in range(num_r):
                if request_vector[j] > need[p_idx][j]:
                    return {
                        "is_safe": False,
                        "need_matrix": need,
                        "safe_sequence": [],
                        "trace": trace,
                        "message": f"Error: Request {request_vector} exceeds maximum need for {request_process} in resource {resources[j]}."
                    }

            # Condition 2: Request <= Available
            for j in range(num_r):
                if request_vector[j] > available[j]:
                    return {
                        "is_safe": False,
                        "need_matrix": need,
                        "safe_sequence": [],
                        "trace": trace,
                        "message": f"Process {request_process} must wait. Resources {resources[j]} not currently available."
                    }

            # Pretend to allocate
            for j in range(num_r):
                avail_copy[j] -= request_vector[j]
                alloc_copy[p_idx][j] += request_vector[j]
                need_copy[p_idx][j] -= request_vector[j]
            trace.append("Resources tentatively allocated. Running Safety Algorithm...")

        # Safety Algorithm
        work = avail_copy[:]
        finish = [False] * num_p
        safe_sequence = []

        count = 0
        while count < num_p:
            found = False
            for i in range(num_p):
                if not finish[i]:
                    # Check if Need[i] <= Work
                    can_allocate = True
                    for j in range(num_r):
                        if need_copy[i][j] > work[j]:
                            can_allocate = False
                            break

                    if can_allocate:
                        for j in range(num_r):
                            work[j] += alloc_copy[i][j]
                        finish[i] = True
                        safe_sequence.append(processes[i])
                        found = True
                        count += 1
                        trace.append(
                            f"Step {count}: {processes[i]} can be allocated. New Work = {work}"
                        )
                        break

            if not found:
                break

        is_safe = (count == num_p)
        if is_safe:
            msg = f"System is in a SAFE state! Safe sequence found: {' -> '.join(safe_sequence)}"
        else:
            msg = "System is in an UNSAFE state! Deadlock could occur."
            trace.append("Deadlock risk detected: Remaining processes cannot satisfy their need with available resources.")

        return {
            "is_safe": is_safe,
            "need_matrix": need,
            "safe_sequence": safe_sequence,
            "trace": trace,
            "message": msg
        }


class PageReplacementSimulator:
    @staticmethod
    def run_fifo(reference_string: List[int], frames_count: int) -> Dict[str, Any]:
        frames = [None] * frames_count
        queue = []
        steps = []
        hits = 0
        faults = 0

        for page in reference_string:
            if page in frames:
                hits += 1
                status = "HIT"
            else:
                faults += 1
                status = "FAULT"
                if len(queue) < frames_count:
                    # Fill first empty slot
                    empty_idx = frames.index(None)
                    frames[empty_idx] = page
                    queue.append(empty_idx)
                else:
                    replace_idx = queue.pop(0)
                    frames[replace_idx] = page
                    queue.append(replace_idx)

            steps.append({
                "page": page,
                "frames": frames[:],
                "status": status
            })

        total = max(len(reference_string), 1)
        return {
            "algorithm": "FIFO",
            "steps": steps,
            "total_references": len(reference_string),
            "hits": hits,
            "faults": faults,
            "hit_ratio": round((hits / total) * 100, 2),
            "fault_ratio": round((faults / total) * 100, 2)
        }

    @staticmethod
    def run_lru(reference_string: List[int], frames_count: int) -> Dict[str, Any]:
        frames = [None] * frames_count
        last_used = {}
        steps = []
        hits = 0
        faults = 0

        for time, page in enumerate(reference_string):
            if page in frames:
                hits += 1
                status = "HIT"
            else:
                faults += 1
                status = "FAULT"
                if None in frames:
                    empty_idx = frames.index(None)
                    frames[empty_idx] = page
                else:
                    # Find page in frames with minimum last_used timestamp
                    lru_page = min(frames, key=lambda p: last_used.get(p, -1))
                    replace_idx = frames.index(lru_page)
                    frames[replace_idx] = page

            last_used[page] = time
            steps.append({
                "page": page,
                "frames": frames[:],
                "status": status
            })

        total = max(len(reference_string), 1)
        return {
            "algorithm": "LRU",
            "steps": steps,
            "total_references": len(reference_string),
            "hits": hits,
            "faults": faults,
            "hit_ratio": round((hits / total) * 100, 2),
            "fault_ratio": round((faults / total) * 100, 2)
        }

    @staticmethod
    def run_optimal(reference_string: List[int], frames_count: int) -> Dict[str, Any]:
        frames = [None] * frames_count
        steps = []
        hits = 0
        faults = 0
        total_len = len(reference_string)

        for i, page in enumerate(reference_string):
            if page in frames:
                hits += 1
                status = "HIT"
            else:
                faults += 1
                status = "FAULT"
                if None in frames:
                    empty_idx = frames.index(None)
                    frames[empty_idx] = page
                else:
                    # Find frame whose next occurrence is furthest in future (or never)
                    furthest_dist = -1
                    replace_idx = 0
                    for f_idx, f_page in enumerate(frames):
                        try:
                            next_pos = reference_string[i + 1:].index(f_page)
                        except ValueError:
                            next_pos = float('inf')
                        if next_pos > furthest_dist:
                            furthest_dist = next_pos
                            replace_idx = f_idx

                    frames[replace_idx] = page

            steps.append({
                "page": page,
                "frames": frames[:],
                "status": status
            })

        total = max(total_len, 1)
        return {
            "algorithm": "Optimal",
            "steps": steps,
            "total_references": total_len,
            "hits": hits,
            "faults": faults,
            "hit_ratio": round((hits / total) * 100, 2),
            "fault_ratio": round((faults / total) * 100, 2)
        }
