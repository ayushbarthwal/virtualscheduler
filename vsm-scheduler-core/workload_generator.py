import csv
import random
import os

def generate_workload(
        num_processes=10,
        burst_range=(2, 20),
        arrival_gap=(0, 5),
        priority_range=(1, 5),
        pattern="random",
        output_path="sample_inputs/generated/random_10.csv"
):
    """
    Generates a process workload CSV file.
    """

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    processes = []
    current_arrival = 0

    for i in range(1, num_processes + 1):
        pid = f"P{i}"

        # Arrival time pattern logic
        if pattern == "random":
            current_arrival += random.randint(*arrival_gap)
        elif pattern == "burst":
            current_arrival += random.randint(0, 2)  # cluster arrivals
        elif pattern == "spaced":
            current_arrival += random.randint(3, 7)  # spaced arrivals

        burst = random.randint(*burst_range)
        priority = random.randint(*priority_range)

        processes.append([pid, current_arrival, burst, priority])

    # Write to CSV
    with open(output_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["PID", "ArrivalTime", "BurstTime", "Priority"])
        writer.writerows(processes)

    print(f"✅ Generated workload: {output_path}")
    print(f"Processes: {num_processes}, Pattern: {pattern}")


# Example usage
if __name__ == "__main__":
    generate_workload(
        num_processes=8,
        burst_range=(3, 15),
        arrival_gap=(0, 4),
        pattern="random"
    )


"""""
python workload_generator.py

"""
