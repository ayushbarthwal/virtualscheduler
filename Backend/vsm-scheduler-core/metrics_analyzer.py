#!/usr/bin/env python3
"""
metrics_analyzer.py

Team Member 3 — Performance Metrics, Analysis & Visualization
------------------------------------------------------------
- Loads scheduler output JSON files (timeline + metrics) produced by scheduler_core.py
- Computes/validates metrics, aggregates algorithm comparisons
- Produces:
    * per-algorithm Gantt chart (.png)
    * comparison bar chart (Avg WT & Avg TAT) (.png)
    * throughput / cpu-util line chart (if multiple workloads) (.png)
    * summary CSV and a one-file PDF report (containing charts + summary table)
- CLI-friendly and robust to missing files.

Notes:
- Uses matplotlib for plotting (one chart per plot).
- No explicit color settings (follows project instruction).
- Requires: pandas, matplotlib
"""

import os
import json
import argparse
from typing import List, Dict, Any, Tuple, Optional
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages

# Default folders
DEFAULT_SCHED_OUT = "outputs"
DEFAULT_METRICS_DIR = "metrics_reports"

os.makedirs(DEFAULT_METRICS_DIR, exist_ok=True)


# -------------------------
# I/O helpers
# -------------------------
def load_scheduler_output(json_path: str) -> Dict[str, Any]:
    """Load a scheduler output JSON and return the parsed dict."""
    with open(json_path, 'r') as f:
        return json.load(f)


def safe_load_metrics(json_path: str) -> Optional[Dict[str, Any]]:
    """Return metrics dict if file exists and is valid, else None."""
    if not os.path.exists(json_path):
        print(f"[WARN] File not found: {json_path}")
        return None
    try:
        data = load_scheduler_output(json_path)
        metrics = data.get("metrics")
        timeline = data.get("timeline", [])
        if metrics is None:
            print(f"[WARN] 'metrics' key missing in {json_path}")
            return None
        return {"metrics": metrics, "timeline": timeline, "raw": data}
    except Exception as e:
        print(f"[ERROR] Failed to load {json_path}: {e}")
        return None


# -------------------------
# Metric summarization
# -------------------------
def metrics_summary_row(metrics_dict: Dict[str, Any], algorithm_name: str) -> Dict[str, Any]:
    """Create one-row summary from metrics JSON structure."""
    avg_wt = metrics_dict.get("avg_waiting", 0.0)
    avg_tat = metrics_dict.get("avg_turnaround", 0.0)
    cpu_util = metrics_dict.get("cpu_utilization", 0.0) * 100.0
    throughput = metrics_dict.get("throughput", 0.0)
    return {
        "Algorithm": algorithm_name,
        "Avg_Waiting": round(avg_wt, 4),
        "Avg_Turnaround": round(avg_tat, 4),
        "CPU_Util_percent": round(cpu_util, 2),
        "Throughput": round(throughput, 6)
    }


# -------------------------
# Plotting: Gantt
# -------------------------
def plot_gantt(timeline: List[Dict[str, Any]], title: str, path: str):
    """
    Draws a horizontal Gantt chart for a single algorithm timeline.
    timeline: list of {"pid":str,"start":int,"end":int}
    """
    if not timeline:
        print(f"[WARN] Empty timeline for {title}; skipping Gantt.")
        return

    # Normalize ordering of PIDs (deterministic)
    pids = []
    for seg in timeline:
        if seg["pid"] not in pids:
            pids.append(seg["pid"])
    pid_to_y = {pid: i for i, pid in enumerate(pids)}

    fig, ax = plt.subplots(figsize=(10, max(2, len(pids) * 0.5)))
    for seg in timeline:
        pid = seg["pid"]
        y = pid_to_y[pid]
        start, end = seg["start"], seg["end"]
        ax.barh(y, end - start, left=start)
        ax.text((start + end) / 2, y, pid, va='center', ha='center', color='white', fontsize=8)

    ax.set_yticks(list(pid_to_y.values()))
    ax.set_yticklabels(list(pid_to_y.keys()))
    ax.set_xlabel("Time")
    ax.set_title(title)
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    print(f"[INFO ] Gantt saved: {path}")


# -------------------------
# Plotting: comparison bar chart
# -------------------------
def plot_comparison_bar(summary_df: pd.DataFrame, path: str):
    """
    Creates a bar chart comparing Avg Waiting and Avg Turnaround across algorithms.
    summary_df must have columns: Algorithm, Avg_Waiting, Avg_Turnaround
    """
    if summary_df.empty:
        print("[WARN] Empty summary df; skipping comparison bar chart.")
        return
    fig, ax = plt.subplots(figsize=(8, 5))
    summary_df.plot(x="Algorithm", y=["Avg_Waiting", "Avg_Turnaround"], kind="bar", ax=ax)
    ax.set_ylabel("Time units")
    ax.set_title("Avg Waiting & Turnaround Time by Algorithm")
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    print(f"[INFO ] Comparison bar chart saved: {path}")


# -------------------------
# Plotting: Throughput & CPU Util line chart
# -------------------------
def plot_throughput_line(summary_df: pd.DataFrame, path: str):
    """
    Simple line chart for Throughput and CPU Utilization (%).
    """
    if summary_df.empty:
        print("[WARN] Empty summary df; skipping throughput chart.")
        return
    fig, ax = plt.subplots(figsize=(8, 4))
    ax2 = ax.twinx()
    summary_df.plot(x="Algorithm", y="Throughput", kind="line", marker='o', ax=ax, legend=False)
    summary_df.plot(x="Algorithm", y="CPU_Util_percent", kind="line", marker='x', ax=ax2, color=None, legend=False)
    ax.set_ylabel("Throughput (jobs/unit time)")
    ax2.set_ylabel("CPU Utilization (%)")
    ax.set_title("Throughput and CPU Utilization by Algorithm")
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    print(f"[INFO ] Throughput line chart saved: {path}")


# -------------------------
# PDF Report Generator
# -------------------------
def generate_pdf_report(
        summary_df: pd.DataFrame,
        gantt_paths: List[Tuple[str, str]],
        bar_chart_path: str,
        throughput_path: str,
        out_pdf_path: str,
        per_algorithm_metrics: Dict[str, Dict]
):
    """
    Produce a single PDF file with:
    - Summary table
    - Bar chart
    - Throughput chart
    - Gantt charts (one per algorithm)
    - Per-algorithm small metric table
    """
    with PdfPages(out_pdf_path) as pdf:
        # Page 1: summary table as image
        fig, ax = plt.subplots(figsize=(8.27, 11.69))  # A4 portrait
        ax.axis('tight')
        ax.axis('off')
        table_df = summary_df.copy()
        table_df = table_df.rename(columns={
            "Avg_Waiting": "Avg Waiting",
            "Avg_Turnaround": "Avg Turnaround",
            "CPU_Util_percent": "CPU Util (%)"
        })
        tbl = ax.table(cellText=table_df.values, colLabels=table_df.columns, loc='center')
        tbl.auto_set_font_size(False)
        tbl.set_fontsize(8)
        tbl.scale(1, 1.2)
        ax.set_title("Algorithm Comparison Summary", fontweight='bold')
        pdf.savefig(fig)
        plt.close()

        # Page 2: bar chart
        if os.path.exists(bar_chart_path):
            fig = plt.figure()
            img = plt.imread(bar_chart_path)
            plt.imshow(img)
            plt.axis('off')
            pdf.savefig()
            plt.close()

        # Page 3: throughput chart
        if os.path.exists(throughput_path):
            fig = plt.figure()
            img = plt.imread(throughput_path)
            plt.imshow(img)
            plt.axis('off')
            pdf.savefig()
            plt.close()

        # Following pages: Gantt charts per algorithm
        for alg_name, gpath in gantt_paths:
            if not os.path.exists(gpath):
                continue
            fig = plt.figure(figsize=(11.69, 8.27))  # landscape
            img = plt.imread(gpath)
            plt.imshow(img)
            plt.axis('off')
            pdf.savefig()
            plt.close()

        # Last page: per-algorithm quick metrics (one small table per algorithm)
        fig, ax = plt.subplots(figsize=(8.27, 11.69))
        ax.axis('off')
        y = 1.0
        ax.text(0.02, y, "Per-Algorithm Metrics (detailed)", fontsize=12, fontweight='bold')
        y -= 0.04
        for alg, metrics in per_algorithm_metrics.items():
            txt = f"{alg}: Avg WT={metrics.get('avg_waiting')}, Avg TAT={metrics.get('avg_turnaround')}, CPU Util={metrics.get('cpu_utilization'):.3f}, Throughput={metrics.get('throughput'):.6f}"
            ax.text(0.02, y, txt, fontsize=9)
            y -= 0.03
        pdf.savefig()
        plt.close()

    print(f"[INFO ] PDF report created: {out_pdf_path}")


# -------------------------
# Main workflow
# -------------------------
def analyze_and_report(
        scheduler_output_dir: str,
        algorithms: List[str],
        metrics_dir: str = DEFAULT_METRICS_DIR,
        generate_pdf: bool = True
) -> Dict[str, Any]:
    """
    High-level function:
    - loads outputs for each algorithm from `scheduler_output_dir`
      (expects files named <alg>_output.json or <alg>_out.json)
    - generates charts and a PDF summary in metrics_dir
    """
    os.makedirs(metrics_dir, exist_ok=True)

    summary_rows = []
    gantt_files = []
    per_algorithm_metrics = {}

    for alg in algorithms:
        # try common filename patterns
        cand1 = os.path.join(scheduler_output_dir, f"{alg.lower()}_output.json")
        cand2 = os.path.join(scheduler_output_dir, f"{alg.lower()}_out.json")
        cand3 = os.path.join(scheduler_output_dir, f"{alg.lower()}_output.json")
        path = cand1 if os.path.exists(cand1) else (cand2 if os.path.exists(cand2) else (cand3 if os.path.exists(cand3) else None))
        if path is None:
            print(f"[WARN] No JSON output found for {alg} in {scheduler_output_dir}; skipping.")
            continue

        loaded = safe_load_metrics(path)
        if loaded is None:
            continue

        metrics = loaded["metrics"]
        timeline = loaded.get("timeline", [])
        per_algorithm_metrics[alg] = metrics

        # summary row
        row = metrics_summary_row(metrics, alg)
        summary_rows.append(row)

        # gantt
        gantt_path = os.path.join(metrics_dir, f"{alg.lower()}_gantt.png")
        plot_gantt(timeline, title=f"{alg} Gantt Chart", path=gantt_path)
        gantt_files.append((alg, gantt_path))

    # create summary dataframe
    if not summary_rows:
        print("[ERROR] No metrics found for any algorithm. Exiting.")
        return {}

    summary_df = pd.DataFrame(summary_rows)
    # reorder columns for readability
    cols = ["Algorithm", "Avg_Waiting", "Avg_Turnaround", "CPU_Util_percent", "Throughput"]
    summary_df = summary_df[cols]

    # save summary CSV
    summary_csv = os.path.join(metrics_dir, "algorithms_comparison_summary.csv")
    summary_df.to_csv(summary_csv, index=False)
    print(f"[INFO ] Summary CSV saved: {summary_csv}")

    # plots
    bar_chart_path = os.path.join(metrics_dir, "comparison_bar_chart.png")
    plot_comparison_bar(summary_df.rename(columns={
        "Avg_Waiting": "Avg_Waiting",
        "Avg_Turnaround": "Avg_Turnaround"
    }), bar_chart_path)

    throughput_path = os.path.join(metrics_dir, "throughput_cpuutil.png")
    plot_throughput_line(summary_df, throughput_path)

    # PDF
    pdf_path = os.path.join(metrics_dir, "scheduling_report.pdf")
    if generate_pdf:
        generate_pdf_report(summary_df, gantt_files, bar_chart_path, throughput_path, pdf_path, per_algorithm_metrics)

    return {
        "summary_df": summary_df,
        "gantt_files": gantt_files,
        "bar_chart": bar_chart_path,
        "throughput_chart": throughput_path,
        "pdf": pdf_path,
        "per_algorithm_metrics": per_algorithm_metrics
    }


# -------------------------
# CLI
# -------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Metrics Analyzer & Visualizer")
    parser.add_argument("--scheduler-outputs", type=str, default=DEFAULT_SCHED_OUT,
                        help="Directory where scheduler outputs (.json) are stored")
    parser.add_argument("--algorithms", type=str, nargs="+",
                        default=["FCFS", "SJF", "SRTF", "RR", "MLFQ", "PRIORITY"],
                        help="List of algorithm names to analyze")
    parser.add_argument("--metrics-dir", type=str, default=DEFAULT_METRICS_DIR,
                        help="Directory to save charts and report")
    parser.add_argument("--no-pdf", action="store_true", help="Skip PDF generation")
    args = parser.parse_args()

    res = analyze_and_report(
        scheduler_output_dir=args.scheduler_outputs,
        algorithms=args.algorithms,
        metrics_dir=args.metrics_dir,
        generate_pdf=not args.no_pdf
    )

    if res:
        print("\n=== Analysis complete ===")
        print(f"Summary saved to: {os.path.join(args.metrics_dir, 'algorithms_comparison_summary.csv')}")
        print(f"PDF report: {res.get('pdf')}")
        print("Generated Gantt charts:")
        for alg, p in res.get("gantt_files", []):
            print(f"  {alg}: {p}")
