# Virtual Scheduler Machine (VSM)

The Virtual Scheduler Machine (VSM) is a comprehensive CPU scheduling simulator designed to demonstrate how different scheduling algorithms manage process execution and system performance in an operating system environment. VSM provides a flexible, modular tool for experimenting with real-world scheduling strategies, visualizing execution timelines, and generating detailed performance metrics for analysis.

## Features

- **Supported Scheduling Algorithms:**
  - First-Come, First-Served (FCFS)
  - Shortest Job First (SJF)
  - Shortest Remaining Time First (SRTF)
  - Priority Scheduling (Preemptive & Non-Preemptive)
  - Round Robin
  - Multi-Level Feedback Queue (MLFQ)

- **Workload Input:**  
  Accepts process datasets in CSV or JSON format, including process ID, arrival time, burst time, and priority.

- **Performance Metrics:**  
  Calculates waiting time, turnaround time, response time, throughput, and CPU utilization.

- **Visualization:**  
  Generates execution timelines, Gantt charts, and comparative data plots.

- **Export Results:**  
  Outputs results in structured JSON and CSV formats for further analysis.

## Project Structure

- `scheduler_core.py`: Implements scheduling algorithms and result generation (timeline, metrics).
- `workload_generator.py`: Script for generating random or patterned process datasets.
- `visualization/`: Data plots, Gantt charts, and tabular outputs for algorithm comparison.
- `tests/`: Performance testing and validation scripts.

## Team

This project was developed by:

- **Akshat Verma** — Team Lead  
- Garv Sabharwal  
- Ayush Barthwal  
- Manas Thapa  

For questions or follow-up tasks, please contact the Team Lead, Akshat Verma.
