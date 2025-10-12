#!/usr/bin/env python3
"""
scheduler_core.py

Provides schedule(process_list, algorithm, params) API and CLI wrapper.
Supports: FCFS, SJF (non-preemptive), SRTF (preemptive), Priority (preemptive & non-preemptive),
Round Robin, simple MLFQ.

Output: dictionary with "timeline" (list of {pid,start,end}), "metrics" (per-process and aggregates).
Deterministic tie-breaking: (primary key, arrival_time, pid).

Author: Team Member 1 template
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Tuple
import heapq
import json
import csv
import copy
import os

@dataclass
class Burst:
    type: str  # 'cpu' or 'io'
    length: int

@dataclass
class Process:
    pid: str
    arrival: int
    bursts: List[Burst] = field(default_factory=list)  # not used heavily for CPU-only mode
    cpu_burst: int = 0   # simplified: single cpu burst used if bursts not provided
    priority: int = 0
    remaining: int = 0
    started: Optional[int] = None
    completed: Optional[int] = None

    def __post_init__(self):
        if isinstance(self.bursts, list) and self.bursts:
            # not used heavily here; fallback
            pass
        self.remaining = self.cpu_burst

def parse_csv_to_processes(csv_path: str) -> List[Process]:
    procs = []
    with open(csv_path, 'r') as f:
        r = csv.DictReader(f)
        for row in r:
            pid = row.get('PID') or row.get('pid') or row.get('id')
            arrival = int(row.get('ArrivalTime') or row.get('Arrival') or row.get('arrival') or row.get('arr') or 0)
            burst = int(row.get('BurstTime') or row.get('Burst') or row.get('burst') or row.get('cpu') or 0)
            pr = int(row.get('Priority') or row.get('priority') or 0)
            p = Process(pid=str(pid), arrival=arrival, cpu_burst=burst, priority=pr)
            p.remaining = burst
            procs.append(p)
    return procs

# -------------------------
# Utility helpers
# -------------------------
def make_timeline_entry(pid, start, end):
    return {"pid": pid, "start": start, "end": end}

def compute_metrics(processes: List[Process], timeline: List[Dict[str,int]], context_switch_time=0):
    per = {}
    # completion times stored in Process.completed
    for p in processes:
        tat = p.completed - p.arrival
        wt = tat - p.cpu_burst
        rt = p.started - p.arrival if p.started is not None else None
        per[p.pid] = {"waiting": wt, "turnaround": tat, "response": rt, "completion": p.completed}
    total_time = max((p.completed for p in processes), default=0)
    total_cpu = sum(p.cpu_burst for p in processes)
    cpu_util = total_cpu / (total_time) if total_time>0 else 0.0
    avg_wait = sum(v["waiting"] for v in per.values())/len(per) if per else 0.0
    avg_tat = sum(v["turnaround"] for v in per.values())/len(per) if per else 0.0
    throughput = len(per)/total_time if total_time>0 else 0.0
    metrics = {
        "per_process": per,
        "avg_waiting": avg_wait,
        "avg_turnaround": avg_tat,
        "throughput": throughput,
        "cpu_utilization": cpu_util,
        "total_time": total_time
    }
    return metrics

# -------------------------
# Scheduling implementations
# -------------------------
def schedule_fcfs(process_list: List[Process], params) -> Dict[str, Any]:
    # sort by arrival then pid
    procs = sorted(process_list, key=lambda p: (p.arrival, p.pid))
    time = 0
    timeline = []
    for p in procs:
        if time < p.arrival:
            time = p.arrival
        p.started = time
        start = time
        end = start + p.cpu_burst
        timeline.append(make_timeline_entry(p.pid, start, end))
        time = end + params.get("context_switch", 0)
        p.completed = end
    metrics = compute_metrics(procs, timeline, params.get("context_switch",0))
    return {"timeline": timeline, "metrics": metrics}

def schedule_sjf_nonpreemptive(process_list: List[Process], params) -> Dict[str, Any]:
    procs = copy.deepcopy(process_list)
    # sort by arrival; we'll maintain a min-heap keyed by burst, arrival, pid
    events = sorted(procs, key=lambda p: p.arrival)
    ready = []
    idx = 0
    time = 0
    timeline = []
    n = len(events)
    while idx < n or ready:
        if not ready:
            # fast-forward
            time = max(time, events[idx].arrival)
        while idx < n and events[idx].arrival <= time:
            p = events[idx]
            heapq.heappush(ready, (p.cpu_burst, p.arrival, p.pid, p))
            idx += 1
        burst, arr, pid, psel = heapq.heappop(ready)
        psel.started = time
        start = time
        end = start + psel.cpu_burst
        timeline.append(make_timeline_entry(psel.pid, start, end))
        psel.completed = end
        time = end + params.get("context_switch",0)
    metrics = compute_metrics(events, timeline, params.get("context_switch",0))
    return {"timeline": timeline, "metrics": metrics}

def schedule_srtf(process_list: List[Process], params) -> Dict[str, Any]:
    # Event-driven simulation using min-heap keyed by remaining time
    procs = [copy.deepcopy(p) for p in process_list]
    procs_by_arr = sorted(procs, key=lambda p: p.arrival)
    ready_heap = []  # (remaining, arrival, pid, process_obj)
    time = 0
    idx = 0
    timeline = []
    current = None
    context = params.get("context_switch", 0)
    last_time = 0
    while idx < len(procs_by_arr) or ready_heap or current:
        # add arrivals
        while idx < len(procs_by_arr) and procs_by_arr[idx].arrival <= time:
            p = procs_by_arr[idx]
            p.remaining = p.cpu_burst
            heapq.heappush(ready_heap, (p.remaining, p.arrival, p.pid, p))
            idx += 1
        if current is None:
            if ready_heap:
                rem, arr, pid, p = heapq.heappop(ready_heap)
                # start p
                if p.started is None:
                    p.started = time
                current = p
                last_time = time
            else:
                # jump to next arrival
                if idx < len(procs_by_arr):
                    time = procs_by_arr[idx].arrival
                    continue
                else:
                    break
        else:
            # compute next event: either arrival of next process or completion of current
            next_arrival_time = procs_by_arr[idx].arrival if idx < len(procs_by_arr) else None
            time_to_completion = current.remaining
            if next_arrival_time is None or time + time_to_completion <= next_arrival_time:
                # current completes before next arrival
                start = time
                end = time + current.remaining
                timeline.append(make_timeline_entry(current.pid, start, end))
                time = end
                current.remaining = 0
                current.completed = time
                current = None
                # apply context switch time (busy time but no useful work)
                time += context
            else:
                # an arrival happens before completion -> run until arrival time then re-evaluate
                run = next_arrival_time - time
                # run current for 'run' units
                start = time
                end = time + run
                timeline.append(make_timeline_entry(current.pid, start, end))
                current.remaining -= run
                time = end
                # push newly arrived processes into ready heap
                while idx < len(procs_by_arr) and procs_by_arr[idx].arrival <= time:
                    p = procs_by_arr[idx]
                    p.remaining = p.cpu_burst
                    heapq.heappush(ready_heap, (p.remaining, p.arrival, p.pid, p))
                    idx += 1
                # compare current.remaining with heap top
                if ready_heap and ready_heap[0][0] < current.remaining:
                    # preempt: push current back, context switch
                    heapq.heappush(ready_heap, (current.remaining, current.arrival, current.pid, current))
                    current = None
                    time += context
                # else continue current in next loop iteration
    # ensure completion times stored; flatten procs list
    # gather all processes
    metrics = compute_metrics(procs, timeline, params.get("context_switch",0))
    return {"timeline": timeline, "metrics": metrics}

def schedule_round_robin(process_list: List[Process], params) -> Dict[str, Any]:
    quantum = int(params.get("quantum", 4))
    if quantum <= 0:
        raise ValueError("Quantum must be > 0 for Round Robin")
    procs = sorted([copy.deepcopy(p) for p in process_list], key=lambda p: (p.arrival, p.pid))
    time = 0
    ready_q = []
    idx = 0
    n = len(procs)
    timeline = []
    while idx < n or ready_q:
        if not ready_q:
            # fast forward
            time = max(time, procs[idx].arrival)
        while idx < n and procs[idx].arrival <= time:
            p = procs[idx]
            p.remaining = p.cpu_burst
            ready_q.append(p)
            idx += 1
        p = ready_q.pop(0)
        if p.started is None:
            p.started = time
        run = min(quantum, p.remaining)
        start = time
        end = time + run
        timeline.append(make_timeline_entry(p.pid, start, end))
        p.remaining -= run
        time = end + params.get("context_switch", 0)
        # enqueue arrivals that came during run time
        while idx < n and procs[idx].arrival <= time:
            q = procs[idx]
            q.remaining = q.cpu_burst
            ready_q.append(q)
            idx += 1
        if p.remaining > 0:
            ready_q.append(p)
        else:
            p.completed = end
    metrics = compute_metrics(procs, timeline, params.get("context_switch",0))
    return {"timeline": timeline, "metrics": metrics}

# Simple MLFQ (demonstration; configurable levels)
def schedule_mlfq(process_list: List[Process], params) -> Dict[str, Any]:
    levels = params.get("levels", 3)
    quanta = params.get("quanta", [4,8,16])
    if len(quanta) < levels:
        # extend by repeating last
        quanta = (quanta + [quanta[-1]]*(levels-len(quanta)))[:levels]
    procs = sorted([copy.deepcopy(p) for p in process_list], key=lambda p:(p.arrival,p.pid))
    time = 0
    idx = 0
    queues = [[] for _ in range(levels)]
    timeline = []
    while idx < len(procs) or any(queues):
        # move arrivals to highest priority queue (0)
        if not any(queues):
            time = max(time, procs[idx].arrival)
        while idx < len(procs) and procs[idx].arrival <= time:
            p = procs[idx]
            p.remaining = p.cpu_burst
            queues[0].append(p)
            idx += 1
        # find highest non-empty queue
        qid = next((i for i,q in enumerate(queues) if q), None)
        if qid is None:
            continue
        p = queues[qid].pop(0)
        if p.started is None:
            p.started = time
        quantum = quanta[qid]
        run = min(quantum, p.remaining)
        start = time
        end = time + run
        timeline.append(make_timeline_entry(p.pid, start, end))
        p.remaining -= run
        time = end + params.get("context_switch",0)
        # arrivals during run
        while idx < len(procs) and procs[idx].arrival <= time:
            qP = procs[idx]
            qP.remaining = qP.cpu_burst
            queues[0].append(qP)
            idx += 1
        if p.remaining > 0:
            # demote if not already lowest
            new_q = min(levels-1, qid+1)
            queues[new_q].append(p)
        else:
            p.completed = end
    metrics = compute_metrics([p for L in queues for p in L] + procs, timeline, params.get("context_switch",0))
    # metrics computation above is only approximate; prefer to track separate
    return {"timeline": timeline, "metrics": metrics}

# -------------------------
# Public API
# -------------------------
def schedule(process_list: List[Process], algorithm: str, params: Optional[Dict[str,Any]]=None) -> Dict[str,Any]:
    """
    process_list: list of Process objects (cpu_burst must be set)
    algorithm: 'FCFS','SJF','SRTF','PRIORITY','PRIORITY-NP','RR','MLFQ'
    params: dictionary with algorithm params, e.g. {'quantum':4, 'context_switch':1}
    """
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
    elif alg == "MLFQ":
        return schedule_mlfq(process_list, params)
    else:
        # priority variants
        if alg.startswith("PRIORITY"):
            # decide preemptive or not by params
            preemptive = params.get("preemptive", True)
            # reuse SRTF-like structure but keyed by priority
            return schedule_priority_generic(process_list, params, preemptive)
        raise ValueError(f"Unknown algorithm: {alg}")

# Priority generic - preemptive or non-preemptive
def schedule_priority_generic(process_list: List[Process], params: Dict[str,Any], preemptive=True):
    procs = [copy.deepcopy(p) for p in process_list]
    procs_by_arr = sorted(procs, key=lambda p: p.arrival)
    ready = []
    time = 0
    idx = 0
    timeline = []
    current = None
    context = params.get("context_switch", 0)
    while idx < len(procs_by_arr) or ready or current:
        while idx < len(procs_by_arr) and procs_by_arr[idx].arrival <= time:
            p = procs_by_arr[idx]
            p.remaining = p.cpu_burst
            heapq.heappush(ready, (p.priority, p.arrival, p.pid, p))
            idx += 1
        if current is None:
            if ready:
                pr, arr, pid, p = heapq.heappop(ready)
                if p.started is None:
                    p.started = time
                current = p
            else:
                if idx < len(procs_by_arr):
                    time = procs_by_arr[idx].arrival
                    continue
                else:
                    break
        else:
            if preemptive:
                next_arrival_time = procs_by_arr[idx].arrival if idx < len(procs_by_arr) else None
                time_to_completion = current.remaining
                if next_arrival_time is None or time + time_to_completion <= next_arrival_time:
                    # finish current
                    start = time
                    end = time + current.remaining
                    timeline.append(make_timeline_entry(current.pid, start, end))
                    time = end
                    current.completed = time
                    current = None
                    time += context
                else:
                    run = next_arrival_time - time
                    start = time
                    end = time + run
                    timeline.append(make_timeline_entry(current.pid, start, end))
                    current.remaining -= run
                    time = end
                    while idx < len(procs_by_arr) and procs_by_arr[idx].arrival <= time:
                        p = procs_by_arr[idx]
                        p.remaining = p.cpu_burst
                        heapq.heappush(ready, (p.priority, p.arrival, p.pid, p))
                        idx += 1
                    if ready and ready[0][0] < current.priority:
                        heapq.heappush(ready, (current.priority, current.arrival, current.pid, current))
                        current = None
                        time += context
                    # else continue current
            else:
                # non-preemptive: run to completion
                start = time
                end = time + current.remaining
                timeline.append(make_timeline_entry(current.pid, start, end))
                current.completed = end
                time = end + context
                current = None
    metrics = compute_metrics(procs, timeline, params.get("context_switch",0))
    return {"timeline": timeline, "metrics": metrics}


# -------------------------
# CLI wrapper for manual runs
# -------------------------
def load_json_processes(path: str) -> List[Process]:
    with open(path,'r') as f:
        arr = json.load(f)
    res = []
    for e in arr:
        pid = e['pid']
        arrival = int(e.get('arrival',0))
        burst = int(e.get('burst', e.get('cpu_burst',0)))
        pr = int(e.get('priority',0))
        p = Process(pid=pid, arrival=arrival, cpu_burst=burst, priority=pr)
        p.remaining = burst
        res.append(p)
    return res

def main_cli():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True, help='CSV or JSON input file')
    parser.add_argument('--alg', default='FCFS', help='Algorithm: FCFS,SJF,SRTF,RR,MLFQ,PRIORITY')
    parser.add_argument('--quantum', type=int, default=4)
    parser.add_argument('--context-switch', type=int, default=0)
    parser.add_argument('--out', default=None, help='output json path')
    parser.add_argument('--preemptive', action='store_true')
    args = parser.parse_args()
    if args.input.endswith('.csv'):
        procs = parse_csv_to_processes(args.input)
    else:
        procs = load_json_processes(args.input)
    res = schedule(procs, args.alg, {'quantum':args.quantum, 'context_switch': args.context_switch, 'preemptive': args.preemptive})
    if args.out:
        with open(args.out,'w') as f:
            json.dump(res, f, indent=2)
    else:
        print(json.dumps(res, indent=2))

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True, help='CSV or JSON input file')
    parser.add_argument('--alg', default='FCFS', help='Algorithm: FCFS,SJF,SRTF,RR,MLFQ,PRIORITY')
    parser.add_argument('--quantum', type=int, default=4)
    parser.add_argument('--context-switch', type=int, default=0)
    parser.add_argument('--out', default=None, help='Output JSON path')
    parser.add_argument('--preemptive', action='store_true')
    args = parser.parse_args()

    # Create outputs directory if it doesn't exist
    OUTPUT_DIR = "outputs"
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if args.input.endswith('.csv'):
        procs = parse_csv_to_processes(args.input)
    else:
        procs = load_json_processes(args.input)

    res = schedule(procs, args.alg, {
        'quantum': args.quantum,
        'context_switch': args.context_switch,
        'preemptive': args.preemptive
    })

    # Output section
    if args.out:
        out_path = os.path.join(OUTPUT_DIR, args.out) if not os.path.dirname(args.out) else args.out
        with open(out_path, 'w') as f:
            json.dump(res, f, indent=2)
        print(f"\n✅ JSON result saved to {out_path}")
    else:
        print(json.dumps(res, indent=2))

    # ---- Pandas Metrics Display ----
    import pandas as pd
    df = pd.DataFrame(res["metrics"]["per_process"]).T
    print("\n=== Per Process Metrics ===")
    print(df)

    # Optional export
    metrics_csv_path = os.path.join(OUTPUT_DIR, "output_metrics.csv")
    df.to_csv(metrics_csv_path, index_label="PID")
    print(f"\n✅ Metrics saved to {metrics_csv_path}")

"""
python scheduler_core.py --input sample_inputs/generated/random_10.csv --alg FCFS --out fcfs_out.json
python scheduler_core.py --input sample_inputs/generated/random_10.csv --alg SJF --out sjf_out.json
python scheduler_core.py --input sample_inputs/generated/random_10.csv --alg SRTF --out srtf_out.json
python scheduler_core.py --input sample_inputs/generated/random_10.csv --alg RR --out rr_out.json
python scheduler_core.py --input sample_inputs/generated/random_10.csv --alg MLFQ --out mlfq_out.json
python scheduler_core.py --input sample_inputs/generated/random_10.csv --alg PRIORITY --out priority_out.json
"""
