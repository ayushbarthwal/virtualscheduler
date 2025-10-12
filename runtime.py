import os
import sys
import json
import csv
import argparse
import subprocess

# ================================================
# Team 4 Runtime Integration & Performance Analyzer
# ================================================
# Responsibilities:
#  - Integrate Team 1 Scheduler Core
#  - Run workloads automatically
#  - Support multi-core simulation
#  - Compute context switches, CPU utilization, total time
#  - Save summary CSV for research & reproducibility

def run_scheduler_cli(input_path, algorithm, out_path, extra_args=None):
    """Call the Team 1 scheduler CLI and store JSON output."""
    cmd = [sys.executable, "vsm-scheduler-core/scheduler_core.py",
           "--input", input_path, "--alg", algorithm, "--out", out_path]
    if extra_args:
        cmd.extend(extra_args)
    subprocess.run(cmd, check=True)
    return out_path


def load_timeline(json_path):
    """Load scheduler output JSON."""
    with open(json_path, "r") as f:
        data = json.load(f)
    timeline = data.get("timeline", [])
    metrics = data.get("metrics", {})
    return timeline, metrics


def compute_context_switches_and_idle(timeline):
    """Compute context switches, CPU utilization, idle time."""
    if not timeline:
        return {"context_switches": 0, "cpu_util": 0.0, "idle_time": 0, "total_time": 0}

    total_time = timeline[-1]["end"]
    context_switches = sum(1 for seg in timeline if seg.get("pid") == "CS")
    idle_time = sum(seg["end"] - seg["start"] for seg in timeline if seg.get("pid") in ["IDLE", "CS"])
    busy_time = total_time - idle_time
    cpu_util = round((busy_time / total_time) * 100, 2) if total_time > 0 else 0.0

    return {
        "context_switches": context_switches,
        "idle_time": idle_time,
        "cpu_util": cpu_util,
        "total_time": total_time
    }


def partition_workload_csv(csv_path, cores):
    """Split a workload CSV into N smaller parts (round-robin)."""
    with open(csv_path, "r") as f:
        reader = list(csv.reader(f))
    header = reader[0]
    rows = reader[1:]

    partitions = [[] for _ in range(cores)]
    for i, row in enumerate(rows):
        partitions[i % cores].append(row)

    output_paths = []
    base_dir = "integration_outputs"
    os.makedirs(base_dir, exist_ok=True)

    for i, part in enumerate(partitions):
        part_path = os.path.join(base_dir, f"core_{i+1}.csv")
        with open(part_path, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(header)
            writer.writerows(part)
        output_paths.append(part_path)

    return output_paths


def run_multicore_simulation(workload_path, algorithm, cores, extra_args=None):
    """Run the same scheduler separately per core."""
    core_files = partition_workload_csv(workload_path, cores)
    all_metrics = []
    os.makedirs("integration_outputs", exist_ok=True)

    for i, core_csv in enumerate(core_files):
        out_json = f"integration_outputs/core_{i+1}_{algorithm}.json"
        run_scheduler_cli(core_csv, algorithm, out_json, extra_args)
        timeline, base_metrics = load_timeline(out_json)
        sys_metrics = compute_context_switches_and_idle(timeline)
        base_metrics.update(sys_metrics)
        base_metrics["core"] = i + 1
        all_metrics.append(base_metrics)

    return all_metrics


def run_and_save_summary(args):
    os.makedirs("integration_outputs", exist_ok=True)
    summary_path = os.path.join("integration_outputs", args.out or "integration_summary.csv")

    if args.cores > 1:
        metrics = run_multicore_simulation(args.workload, args.alg, args.cores)
    else:
        out_json = f"integration_outputs/single_{args.alg}.json"
        run_scheduler_cli(args.workload, args.alg, out_json)
        timeline, base_metrics = load_timeline(out_json)
        sys_metrics = compute_context_switches_and_idle(timeline)
        base_metrics.update(sys_metrics)
        base_metrics["core"] = 1
        metrics = [base_metrics]

    fieldnames = sorted(set(k for m in metrics for k in m.keys()))
    with open(summary_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(metrics)

    print(f"\n✅ Results saved to: {summary_path}")
    print(f"   Run count: {len(metrics)} cores processed.")
    print("   Open this CSV to analyze scheduler performance.")


def main():
    parser = argparse.ArgumentParser(description="Team 4: Scheduler Integration Runtime")
    parser.add_argument("--workload", required=True, help="Path to workload CSV")
    parser.add_argument("--alg", required=True, help="Algorithm (FCFS, SJF, SRTF, RR, PRIORITY, MLFQ)")
    parser.add_argument("--cores", type=int, default=1, help="Number of cores (default: 1)")
    parser.add_argument("--out", type=str, default="integration_summary.csv", help="Output CSV name")
    parser.add_argument("--extra-args", nargs=argparse.REMAINDER, help="Extra args for scheduler CLI")
    args = parser.parse_args()
    run_and_save_summary(args)


if __name__ == "__main__":
    main()
