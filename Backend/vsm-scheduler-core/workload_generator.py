#!/usr/bin/env python3
"""
workload_generator.py

Team Member 2 — Workload Generator Module
------------------------------------------
Purpose:
    Generates realistic process workloads for the Virtual Scheduling Machine project.
    It can produce random, bursty, or evenly spaced workloads and export them as CSV or JSON.

Features:
    ✅ Adjustable process count, burst time, arrival intervals, and priority levels.
    ✅ Multiple workload patterns (random, burst, spaced).
    ✅ Optional queue-level assignment (for MLQ/MLFQ testing).
    ✅ Automatically creates output folders.
    ✅ CLI interface for integration with runtime engine.
    ✅ CSV + JSON export for flexible testing.

Output schema:
    PID, ArrivalTime, BurstTime, Priority, QueueLevel

Author:
    Team Member 2 — Workload Generation & Process Modeling
"""

import csv
import json
import random
import os
import argparse
from typing import List, Dict


# -------------------------------------- #
# Workload Generation Function
# -------------------------------------- #
def generate_workload(
        num_processes: int = 10,
        burst_range=(2, 20),
        arrival_gap=(0, 5),
        priority_range=(1, 5),
        queue_levels: int = 3,
        pattern: str = "random",
        output_dir: str = "sample_inputs/generated",
        filename: str = "random_10.csv"
) -> Dict[str, List[Dict]]:
    """
    Generate process workload data and export to CSV + JSON.

    :param num_processes: Number of processes to generate
    :param burst_range: Range of CPU burst times (min, max)
    :param arrival_gap: Range of gaps between consecutive arrivals
    :param priority_range: Range of priorities (lower = higher priority)
    :param queue_levels: Number of MLQ queue levels
    :param pattern: Arrival pattern ('random', 'burst', 'spaced')
    :param output_dir: Directory to store output files
    :param filename: Output CSV filename
    :return: Dictionary representation of workload
    """
    os.makedirs(output_dir, exist_ok=True)

    processes = []
    current_arrival = 0

    for i in range(1, num_processes + 1):
        pid = f"P{i}"

        # Arrival pattern logic
        if pattern == "random":
            current_arrival += random.randint(*arrival_gap)
        elif pattern == "burst":
            current_arrival += random.randint(0, 2)  # cluster arrivals together
        elif pattern == "spaced":
            current_arrival += random.randint(3, 7)  # more spaced out arrivals
        else:
            raise ValueError(f"Unknown pattern: {pattern}")

        burst = random.randint(*burst_range)
        priority = random.randint(*priority_range)
        queue_level = random.randint(0, queue_levels - 1)

        processes.append({
            "PID": pid,
            "ArrivalTime": current_arrival,
            "BurstTime": burst,
            "Priority": priority,
            "QueueLevel": queue_level
        })

    # File paths
    csv_path = os.path.join(output_dir, filename)
    json_path = os.path.splitext(csv_path)[0] + ".json"

    # Write to CSV
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["PID", "ArrivalTime", "BurstTime", "Priority", "QueueLevel"])
        writer.writeheader()
        writer.writerows(processes)

    # Write to JSON
    with open(json_path, "w") as f:
        json.dump(processes, f, indent=2)

    print(f"✅ Generated workload:")
    print(f"   • CSV  → {csv_path}")
    print(f"   • JSON → {json_path}")
    print(f"Processes: {num_processes}, Pattern: {pattern}, Queue Levels: {queue_levels}")

    return {"processes": processes, "csv": csv_path, "json": json_path}


# -------------------------------------- #
# Helper Function for Batch Generation
# -------------------------------------- #
def generate_multiple_workloads():
    """
    Generates multiple workloads for testing all algorithms.
    """
    presets = [
        {"num_processes": 8, "pattern": "random", "filename": "random_8.csv"},
        {"num_processes": 10, "pattern": "burst", "filename": "burst_10.csv"},
        {"num_processes": 12, "pattern": "spaced", "filename": "spaced_12.csv"},
    ]

    for p in presets:
        generate_workload(**p)


# -------------------------------------- #
# Command Line Interface
# -------------------------------------- #
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Workload Generator for Scheduling Simulator")
    parser.add_argument("--num", type=int, default=10, help="Number of processes")
    parser.add_argument("--burst-min", type=int, default=2, help="Minimum CPU burst time")
    parser.add_argument("--burst-max", type=int, default=20, help="Maximum CPU burst time")
    parser.add_argument("--arrival-min", type=int, default=0, help="Minimum arrival gap")
    parser.add_argument("--arrival-max", type=int, default=5, help="Maximum arrival gap")
    parser.add_argument("--priority-min", type=int, default=1, help="Minimum priority value")
    parser.add_argument("--priority-max", type=int, default=5, help="Maximum priority value")
    parser.add_argument("--queues", type=int, default=3, help="Number of queue levels for MLQ/MLFQ")
    parser.add_argument("--pattern", type=str, default="random", choices=["random", "burst", "spaced"],
                        help="Arrival pattern type")
    parser.add_argument("--outdir", type=str, default="sample_inputs/generated", help="Output directory")
    parser.add_argument("--filename", type=str, default="random_10.csv", help="Output CSV filename")

    args = parser.parse_args()

    generate_workload(
        num_processes=args.num,
        burst_range=(args.burst_min, args.burst_max),
        arrival_gap=(args.arrival_min, args.arrival_max),
        priority_range=(args.priority_min, args.priority_max),
        queue_levels=args.queues,
        pattern=args.pattern,
        output_dir=args.outdir,
        filename=args.filename
    )
