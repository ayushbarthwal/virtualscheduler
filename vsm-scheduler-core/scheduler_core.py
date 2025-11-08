#!/usr/bin/env python3
"""
scheduler_core.py

Provides schedule(process_list, algorithm, params) API and CLI wrapper.
Supports: FCFS, SJF (non-preemptive), SRTF (preemptive),
Priority (preemptive & non-preemptive), Round Robin,
Static MLQ (Multilevel Queue), and MLFQ (Multilevel Feedback Queue).

Output: dictionary with "timeline" (list of {pid,start,end}),
and "metrics" (per-process and aggregate statistics).

Author: Team Member 1 — Core Scheduling Engine
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import heapq, json, csv, copy, os
import pandas as pd


# ------------------------- #
# Data Structures
# ------------------------- #
@dataclass
class Process:
    pid: str
    arrival: int
    cpu_burst: int = 0
    priority: int = 0
    queue_level: int = 0
    remaining: int = 0
    started: Optional[int] = None
    completed: Optional[int] = None

    def __post_init__(self):
        self.remaining = self.cpu_burst


# ------------------------- #
# Utility Helpers
# ------------------------- #
def make_timeline_entry(pid, start, end):
    return {"pid": pid, "start": start, "end": end}


def compute_metrics(processes: List[Process], timeline: List[Dict[str, int]], context_switch_time=0):
    per = {}
    for p in processes:
        tat = p.completed - p.arrival if p.completed is not None else 0
        wt = tat - p.cpu_burst
        rt = p.started - p.arrival if p.started is not None else None
        per[p.pid] = {"waiting": wt, "turnaround": tat, "response": rt, "completion": p.completed}

    total_time = max((p.completed for p in processes if p.completed), default=0)
    total_cpu = sum(p.cpu_burst for p in processes)
    cpu_util = total_cpu / total_time if total_time > 0 else 0
    avg_wait = sum(v["waiting"] for v in per.values()) / len(per) if per else 0
    avg_tat = sum(v["turnaround"] for v in per.values()) / len(per) if per else 0
    throughput = len(per) / total_time if total_time > 0 else 0

    return {
        "per_process": per,
        "avg_waiting": avg_wait,
        "avg_turnaround": avg_tat,
        "throughput": throughput,
        "cpu_utilization": cpu_util,
        "total_time": total_time
    }


def parse_csv_to_processes(csv_path: str) -> List[Process]:
    procs = []
    with open(csv_path, 'r') as f:
        r = csv.DictReader(f)
        for row in r:
            pid = row.get('PID') or row.get('pid')
            arrival = int(row.get('ArrivalTime') or row.get('arrival') or 0)
            burst = int(row.get('BurstTime') or row.get('burst') or 0)
            pr = int(row.get('Priority') or row.get('priority') or 0)
            ql = int(row.get('QueueLevel') or row.get('queue_level') or 0)
            p = Process(pid=str(pid), arrival=arrival, cpu_burst=burst, priority=pr, queue_level=ql)
            procs.append(p)
    return procs


# ------------------------- #
# Scheduling Implementations
# ------------------------- #
def schedule_fcfs(process_list: List[Process], params):
    procs = sorted(process_list, key=lambda p: (p.arrival, p.pid))
    time, timeline = 0, []
    for p in procs:
        if time < p.arrival:
            time = p.arrival
        p.started = time
        start, end = time, time + p.cpu_burst
        timeline.append(make_timeline_entry(p.pid, start, end))
        p.completed = end
        time = end + params.get("context_switch", 0)
    return {"timeline": timeline, "metrics": compute_metrics(procs, timeline, params.get("context_switch", 0))}


def schedule_sjf_nonpreemptive(process_list: List[Process], params):
    events = sorted(copy.deepcopy(process_list), key=lambda p: p.arrival)
    ready, timeline = [], []
    idx, time, n = 0, 0, len(events)
    while idx < n or ready:
        if not ready:
            time = max(time, events[idx].arrival)
        while idx < n and events[idx].arrival <= time:
            p = events[idx]
            heapq.heappush(ready, (p.cpu_burst, p.arrival, p.pid, p))
            idx += 1
        _, _, _, psel = heapq.heappop(ready)
        psel.started, start, end = time, time, time + psel.cpu_burst
        timeline.append(make_timeline_entry(psel.pid, start, end))
        psel.completed = end
        time = end + params.get("context_switch", 0)
    return {"timeline": timeline, "metrics": compute_metrics(events, timeline, params.get("context_switch", 0))}


def schedule_srtf(process_list: List[Process], params):
    procs = [copy.deepcopy(p) for p in process_list]
    ready_heap, timeline = [], []
    procs_by_arr = sorted(procs, key=lambda p: p.arrival)
    time, idx, current = 0, 0, None
    context = params.get("context_switch", 0)

    while idx < len(procs_by_arr) or ready_heap or current:
        while idx < len(procs_by_arr) and procs_by_arr[idx].arrival <= time:
            p = procs_by_arr[idx]
            heapq.heappush(ready_heap, (p.remaining, p.arrival, p.pid, p))
            idx += 1
        if current is None:
            if ready_heap:
                _, _, _, p = heapq.heappop(ready_heap)
                if p.started is None:
                    p.started = time
                current = p
            else:
                if idx < len(procs_by_arr):
                    time = procs_by_arr[idx].arrival
                    continue
                break
        else:
            next_arrival_time = procs_by_arr[idx].arrival if idx < len(procs_by_arr) else None
            if next_arrival_time is None or time + current.remaining <= next_arrival_time:
                start, end = time, time + current.remaining
                timeline.append(make_timeline_entry(current.pid, start, end))
                time = end
                current.completed, current = time, None
                time += context
            else:
                run = next_arrival_time - time
                start, end = time, time + run
                timeline.append(make_timeline_entry(current.pid, start, end))
                current.remaining -= run
                time = end
                while idx < len(procs_by_arr) and procs_by_arr[idx].arrival <= time:
                    p = procs_by_arr[idx]
                    heapq.heappush(ready_heap, (p.remaining, p.arrival, p.pid, p))
                    idx += 1
                if ready_heap and ready_heap[0][0] < current.remaining:
                    heapq.heappush(ready_heap, (current.remaining, current.arrival, current.pid, current))
                    current, time = None, time + context
    return {"timeline": timeline, "metrics": compute_metrics(procs, timeline, context)}


def schedule_round_robin(process_list: List[Process], params):
    quantum = int(params.get("quantum", 4))
    if quantum <= 0:
        raise ValueError("Quantum must be > 0")
    procs = sorted([copy.deepcopy(p) for p in process_list], key=lambda p: (p.arrival, p.pid))
    time, ready_q, idx, n = 0, [], 0, len(procs)
    timeline = []
    while idx < n or ready_q:
        if not ready_q:
            time = max(time, procs[idx].arrival)
        while idx < n and procs[idx].arrival <= time:
            p = procs[idx]
            ready_q.append(p)
            idx += 1
        p = ready_q.pop(0)
        if p.started is None:
            p.started = time
        run = min(quantum, p.remaining)
        start, end = time, time + run
        timeline.append(make_timeline_entry(p.pid, start, end))
        p.remaining -= run
        time = end + params.get("context_switch", 0)
        while idx < n and procs[idx].arrival <= time:
            ready_q.append(procs[idx])
            idx += 1
        if p.remaining > 0:
            ready_q.append(p)
        else:
            p.completed = end
    return {"timeline": timeline, "metrics": compute_metrics(procs, timeline, params.get("context_switch", 0))}


def schedule_priority_generic(process_list: List[Process], params, preemptive=True):
    procs = [copy.deepcopy(p) for p in process_list]
    procs_by_arr = sorted(procs, key=lambda p: p.arrival)
    ready, timeline, time, idx, current = [], [], 0, 0, None
    context = params.get("context_switch", 0)
    while idx < len(procs_by_arr) or ready or current:
        while idx < len(procs_by_arr) and procs_by_arr[idx].arrival <= time:
            p = procs_by_arr[idx]
            heapq.heappush(ready, (p.priority, p.arrival, p.pid, p))
            idx += 1
        if current is None:
            if ready:
                _, _, _, p = heapq.heappop(ready)
                if p.started is None:
                    p.started = time
                current = p
            else:
                if idx < len(procs_by_arr):
                    time = procs_by_arr[idx].arrival
                    continue
                break
        else:
            if preemptive:
                next_arrival = procs_by_arr[idx].arrival if idx < len(procs_by_arr) else None
                if next_arrival is None or time + current.remaining <= next_arrival:
                    start, end = time, time + current.remaining
                    timeline.append(make_timeline_entry(current.pid, start, end))
                    time = end
                    current.completed, current = time, None
                    time += context
                else:
                    run = next_arrival - time
                    start, end = time, time + run
                    timeline.append(make_timeline_entry(current.pid, start, end))
                    current.remaining -= run
                    time = end
                    while idx < len(procs_by_arr) and procs_by_arr[idx].arrival <= time:
                        p = procs_by_arr[idx]
                        heapq.heappush(ready, (p.priority, p.arrival, p.pid, p))
                        idx += 1
                    if ready and ready[0][0] < current.priority:
                        heapq.heappush(ready, (current.priority, current.arrival, current.pid, current))
                        current, time = None, time + context
            else:
                start, end = time, time + current.remaining
                timeline.append(make_timeline_entry(current.pid, start, end))
                current.completed = end
                time, current = end + context, None
    return {"timeline": timeline, "metrics": compute_metrics(procs, timeline, context)}


def schedule_mlq(process_list: List[Process], params):
    queues = params.get("queues", 3)
    context = params.get("context_switch", 0)
    procs = sorted(copy.deepcopy(process_list), key=lambda p: (p.arrival, p.pid))
    timeline, time = [], 0
    for qid in range(queues):
        q_procs = [p for p in procs if p.queue_level == qid]
        q_procs.sort(key=lambda p: (p.arrival, p.pid))
        for p in q_procs:
            if time < p.arrival:
                time = p.arrival
            p.started = time
            start, end = time, time + p.cpu_burst
            timeline.append(make_timeline_entry(p.pid, start, end))
            p.completed = end
            time = end + context
    return {"timeline": timeline, "metrics": compute_metrics(procs, timeline, context)}


def schedule_mlfq(process_list: List[Process], params):
    levels = params.get("levels", 3)
    quanta = params.get("quanta", [4, 8, 16])
    if len(quanta) < levels:
        quanta = (quanta + [quanta[-1]] * (levels - len(quanta)))[:levels]
    procs = sorted(copy.deepcopy(process_list), key=lambda p: (p.arrival, p.pid))
    time, idx, queues = 0, 0, [[] for _ in range(levels)]
    timeline, context = [], params.get("context_switch", 0)
    while idx < len(procs) or any(queues):
        if not any(queues):
            time = max(time, procs[idx].arrival)
        while idx < len(procs) and procs[idx].arrival <= time:
            p = procs[idx]
            queues[0].append(p)
            idx += 1
        qid = next((i for i, q in enumerate(queues) if q), None)
        if qid is None:
            continue
        p = queues[qid].pop(0)
        if p.started is None:
            p.started = time
        quantum = quanta[qid]
        run = min(quantum, p.remaining)
        start, end = time, time + run
        timeline.append(make_timeline_entry(p.pid, start, end))
        p.remaining -= run
        time = end + context
        while idx < len(procs) and procs[idx].arrival <= time:
            queues[0].append(procs[idx])
            idx += 1
        if p.remaining > 0:
            new_q = min(levels - 1, qid + 1)
            queues[new_q].append(p)
        else:
            p.completed = end
    return {"timeline": timeline, "metrics": compute_metrics(procs, timeline, context)}


# ------------------------- #
# Public API
# ------------------------- #
def schedule(process_list: List[Process], algorithm: str, params: Optional[Dict[str, Any]] = None):
    if params is None:
        params = {}
    alg = algorithm.strip().upper()
    if alg == "FCFS":
        return schedule_fcfs(process_list, params)
    elif alg == "SJF":
        return schedule_sjf_nonpreemptive(process_list, params)
    elif alg == "SRTF":
        return schedule_srtf(process_list, params)
    elif alg == "RR":
        return schedule_round_robin(process_list, params)
    elif alg == "PRIORITY":
        return schedule_priority_generic(process_list, params, params.get("preemptive", True))
    elif alg == "MLQ":
        return schedule_mlq(process_list, params)
    elif alg == "MLFQ":
        return schedule_mlfq(process_list, params)
    else:
        raise ValueError(f"Unknown algorithm: {alg}")


# ------------------------- #
# CLI Entry Point
# ------------------------- #
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="CPU Scheduling Core Engine")
    parser.add_argument('--input', required=True, help='CSV or JSON input file')
    parser.add_argument('--alg', required=True, help='Algorithm name (FCFS, SJF, SRTF, RR, PRIORITY, MLQ, MLFQ)')
    parser.add_argument('--quantum', type=int, default=4)
    parser.add_argument('--context-switch', type=int, default=0)
    parser.add_argument('--queues', type=int, default=3)
    parser.add_argument('--out', default=None, help='Output JSON filename (optional)')
    parser.add_argument('--preemptive', action='store_true')
    args = parser.parse_args()

    OUTPUT_DIR = "outputs"
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if args.input.endswith(".csv"):
        procs = parse_csv_to_processes(args.input)
    else:
        with open(args.input, 'r') as f:
            data = json.load(f)
        procs = [Process(pid=d["pid"], arrival=d["arrival"], cpu_burst=d["burst"], priority=d.get("priority", 0)) for d in data]

    result = schedule(procs, args.alg, {
        "quantum": args.quantum,
        "context_switch": args.context_switch,
        "queues": args.queues,
        "preemptive": args.preemptive
    })

    out_file = args.out or f"{args.alg.lower()}_output.json"
    out_path = os.path.join(OUTPUT_DIR, out_file)
    with open(out_path, 'w') as f:
        json.dump(result, f, indent=2)
    print(f"\n✅ JSON result saved to: {out_path}")

    df = pd.DataFrame(result["metrics"]["per_process"]).T
    print("\n=== Per Process Metrics ===")
    print(df)
    print("\n=== Aggregate Metrics ===")
    print(f"Average Waiting Time: {result['metrics']['avg_waiting']:.2f}")
    print(f"Average Turnaround Time: {result['metrics']['avg_turnaround']:.2f}")
    print(f"CPU Utilization: {result['metrics']['cpu_utilization']*100:.2f}%")
    print(f"Throughput: {result['metrics']['throughput']:.3f}")

    metrics_csv_path = os.path.join(OUTPUT_DIR, f"{args.alg.lower()}_metrics.csv")
    df.to_csv(metrics_csv_path, index_label="PID")
    print(f"\n📊 Metrics CSV exported to: {metrics_csv_path}")
    print("\n✅ Execution completed successfully.\n")
