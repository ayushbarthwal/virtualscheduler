import pandas as pd
import matplotlib.pyplot as plt
import json
import os

SCHEDULER_OUTPUT_DIR = "outputs"  # Where scheduler outputs are stored
METRICS_DIR = "metrics"           # Where charts and analyzer outputs are saved

os.makedirs(METRICS_DIR, exist_ok=True)

def load_metrics_from_json(json_path):
    with open(json_path, 'r') as f:
        data = json.load(f)
    return data["metrics"]

def load_metrics_from_csv(csv_path):
    df = pd.read_csv(csv_path)
    df.set_index("PID", inplace=True)
    return df

def compute_summary_table(metrics_dict, algorithm_name):
    df = pd.DataFrame(metrics_dict["per_process"]).T
    avg_wt = metrics_dict["avg_waiting"]
    avg_tat = metrics_dict["avg_turnaround"]
    cpu_util = metrics_dict["cpu_utilization"] * 100
    throughput = metrics_dict["throughput"]
    return {
        "Algorithm": algorithm_name,
        "Avg WT": round(avg_wt, 2),
        "Avg TAT": round(avg_tat, 2),
        "CPU Util": f"{round(cpu_util, 1)}%",
        "Throughput": f"{round(throughput, 2)} jobs/sec"
    }

def compare_algorithms(metrics_json_paths, algorithm_names):
    summary = []
    for path, name in zip(metrics_json_paths, algorithm_names):
        if os.path.exists(path):
            metrics = load_metrics_from_json(path)
            summary.append(compute_summary_table(metrics, name))
        else:
            print(f"Metrics file not found for {name}: {path}")
    df = pd.DataFrame(summary)
    print("\nAlgorithm Comparison Table:")
    print(df)
    df.to_csv(os.path.join(METRICS_DIR, "comparison_table.csv"), index=False)
    print(f"Saved comparison table to {os.path.join(METRICS_DIR, 'comparison_table.csv')}")
    return df

def plot_gantt(timeline, title="Gantt Chart", filename="gantt_chart.png"):
    fig, ax = plt.subplots(figsize=(8, 2))
    for entry in timeline:
        ax.barh(0, entry["end"] - entry["start"], left=entry["start"], label=entry["pid"])
        ax.text((entry["start"] + entry["end"]) / 2, 0, entry["pid"], va='center', ha='center', color='white')
    ax.set_yticks([])
    ax.set_xlabel("Time")
    ax.set_title(title)
    plt.tight_layout()
    gantt_path = os.path.join(METRICS_DIR, filename)
    plt.savefig(gantt_path)
    print(f"Gantt chart saved to {gantt_path}")
    plt.close()

def plot_bar_chart(summary_df):
    fig, ax = plt.subplots(figsize=(7, 4))
    summary_df.plot(x="Algorithm", y=["Avg WT", "Avg TAT"], kind="bar", ax=ax)
    ax.set_ylabel("Time")
    ax.set_title("Average Waiting & Turnaround Time by Algorithm")
    plt.tight_layout()
    bar_path = os.path.join(METRICS_DIR, "metrics_bar_chart.png")
    plt.savefig(bar_path)
    print(f"Bar chart saved to {bar_path}")
    plt.close()

if __name__ == "__main__":
    algorithms = [
        "FCFS",
        "SJF",
        "SRTF",
        "RR",
        "MLFQ",
        "PRIORITY"
    ]
    metrics_json_paths = [os.path.join(SCHEDULER_OUTPUT_DIR, f"{alg.lower()}_out.json") for alg in algorithms]
    algorithm_names = algorithms

    # Compare algorithms and plot bar chart
    summary_df = compare_algorithms(metrics_json_paths, algorithm_names)
    plot_bar_chart(summary_df)

    # Plot Gantt chart for each algorithm
    for alg, json_path in zip(algorithm_names, metrics_json_paths):
        if os.path.exists(json_path):
            with open(json_path) as f:
                timeline = json.load(f).get("timeline", [])
            plot_gantt(timeline, title=f"{alg} Gantt Chart", filename=f"{alg.lower()}_gantt_chart.png")
        else:
            print(f"Timeline file not found for {alg}: {json_path}")

    # Optionally, print per-process metrics for each algorithm
    for alg in algorithm_names:
        csv_path = os.path.join(SCHEDULER_OUTPUT_DIR, f"{alg.lower()}_metrics.csv")
        if os.path.exists(csv_path):
            df = load_metrics_from_csv(csv_path)
            print(f"\nPer Process Metrics for {alg}:")
            print(df)