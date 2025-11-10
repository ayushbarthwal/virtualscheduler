from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import pandas as pd
import subprocess
import json
import time
import csv

app = Flask(__name__)
CORS(app)

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUTS_DIR = os.path.join(ROOT_DIR, 'outputs')
INTEGRATION_DIR = os.path.join(ROOT_DIR, 'integration_outputs')
VSM_CORE_DIR = os.path.join(ROOT_DIR, 'vsm-scheduler-core')
REPORTS_DIR = os.path.join(VSM_CORE_DIR, 'metrics_reports')
TEAM4_RUNTIME = os.path.join(ROOT_DIR, 'runtime.py')
ANALYZER_SCRIPT = os.path.join(VSM_CORE_DIR, 'metrics_analyzer.py')

os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(INTEGRATION_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

def save_workload_csv(workload, csv_path):
    with open(csv_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['PID', 'ArrivalTime', 'BurstTime', 'Priority'])
        writer.writeheader()
        for row in workload:
            writer.writerow({
                'PID': row.get('process', ''),
                'ArrivalTime': row.get('arrival', 0),
                'BurstTime': row.get('burst', 1),
                'Priority': row.get('priority', 1)
            })

@app.route('/api/metrics')
def get_metrics():
    metrics_path = os.path.join(OUTPUTS_DIR, 'output_metrics.csv')
    if not os.path.exists(metrics_path):
        return jsonify({'error': 'Metrics file not found'}), 404
    try:
        df = pd.read_csv(metrics_path)
        return jsonify(df.to_dict(orient='records'))
    except Exception as e:
        return jsonify({'error': f'Failed to read metrics: {str(e)}'}), 500

@app.route('/api/schedule', methods=['POST'])
def schedule():
    data = request.get_json()
    algorithms = data.get('algorithm')
    context_switch = data.get('context_switch', '2')
    workload = data.get('workload')

    if not algorithms or not workload:
        return jsonify({'error': 'Algorithm(s) and workload required'}), 400

    if isinstance(algorithms, str):
        algorithms = [algorithms]

    run_id = time.strftime("%Y%m%d_%H%M%S")
    results = {}

    for algorithm in algorithms:
        workload_csv_filename = f"workload_{algorithm.lower()}_{run_id}.csv"
        workload_csv_path = os.path.join(OUTPUTS_DIR, workload_csv_filename)
        try:
            save_workload_csv(workload, workload_csv_path)
        except Exception as e:
            results[algorithm] = {'error': f'Failed to save workload CSV: {str(e)}'}
            continue

        try:
            result = subprocess.run(
                [
                    "python", TEAM4_RUNTIME,
                    "--workload", workload_csv_path,
                    "--alg", algorithm,
                    "--context-switch", str(context_switch),
                    "--cores", "1"
                ],
                cwd=ROOT_DIR,
                capture_output=True, text=True
            )
            if result.returncode != 0:
                print("team4_runtime.py error:", result.stderr)
                results[algorithm] = {'error': result.stderr}
                continue

            json_files = [f for f in os.listdir(INTEGRATION_DIR) if f.endswith('.json') and algorithm.lower() in f.lower()]
            if not json_files:
                json_files = [f for f in os.listdir(INTEGRATION_DIR) if f.endswith('.json')]
            if not json_files:
                results[algorithm] = {'error': 'No output JSON generated'}
                continue

            json_files.sort(key=lambda f: os.path.getmtime(os.path.join(INTEGRATION_DIR, f)), reverse=True)
            output_json_path = os.path.join(INTEGRATION_DIR, json_files[0])
            with open(output_json_path) as f:
                metrics = json.load(f)

            results[algorithm] = {
                "metrics": metrics
            }
        except Exception as e:
            print("API error:", str(e))
            results[algorithm] = {'error': str(e)}

    try:
        analyzer_cmd = [
            "python", ANALYZER_SCRIPT,
            "--scheduler-outputs", INTEGRATION_DIR,
            "--algorithms"
        ] + algorithms + [
            "--run-id", run_id,
            "--metrics-dir", REPORTS_DIR
        ]
        analyzer_result = subprocess.run(analyzer_cmd, cwd=VSM_CORE_DIR, capture_output=True, text=True)
        if analyzer_result.returncode != 0:
            print("metrics_analyzer.py error:", analyzer_result.stderr)
    except Exception as e:
        print("metrics_analyzer.py error:", str(e))

    charts = [f for f in os.listdir(REPORTS_DIR) if f.endswith('.png') and run_id in f]
    pdfs = [f for f in os.listdir(REPORTS_DIR) if f.endswith('.pdf') and run_id in f]
    for algorithm in algorithms:
        if algorithm in results:
            results[algorithm]["charts"] = charts
            results[algorithm]["reports"] = pdfs

    return jsonify(results)

@app.route('/api/integration_outputs/<filename>')
def get_integration_output(filename):
    return send_from_directory(INTEGRATION_DIR, filename)

@app.route('/api/outputs/<filename>')
def get_output_file(filename):
    return send_from_directory(OUTPUTS_DIR, filename)

@app.route('/api/charts/<filename>')
def get_chart(filename):
    return send_from_directory(REPORTS_DIR, filename)

@app.route('/api/reports/<filename>')
def get_report(filename):
    return send_from_directory(REPORTS_DIR, filename)

if __name__ == '__main__':
    app.run(port=5000, debug=True)