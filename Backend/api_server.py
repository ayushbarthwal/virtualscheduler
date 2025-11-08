from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import pandas as pd
import subprocess
import json

app = Flask(__name__)
CORS(app)

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUTS_DIR = os.path.join(ROOT_DIR, 'outputs')
INTEGRATION_DIR = os.path.join(ROOT_DIR, 'integration_outputs')
REPORTS_DIR = os.path.join(ROOT_DIR, 'vsm-scheduler-core', 'metrics_reports')
TEAM4_RUNTIME = os.path.join(ROOT_DIR, 'team4_runtime.py')
ANALYZER_SCRIPT = os.path.join(ROOT_DIR, 'vsm-scheduler-core', 'metrics_analyzer.py')

os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(INTEGRATION_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

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
    algorithm = request.form.get('algorithm')
    file = request.files.get('workload')
    context_switch = request.form.get('context_switch', '2')  # Default to 2 if not provided

    if not algorithm or not file:
        return jsonify({'error': 'Algorithm and workload file required'}), 400

    # Save uploaded file
    file_path = os.path.join(OUTPUTS_DIR, file.filename)
    try:
        file.save(file_path)
    except Exception as e:
        return jsonify({'error': f'Failed to save file: {str(e)}'}), 500

    # Run team4_runtime.py with the provided file and algorithm
    try:
        result = subprocess.run(
            [
                "python", TEAM4_RUNTIME,
                "--workload", file_path,
                "--alg", algorithm,
                "--context-switch", context_switch,
                "--cores", "1"
            ],
            cwd=ROOT_DIR,
            capture_output=True, text=True
        )
        if result.returncode != 0:
            print("team4_runtime.py error:", result.stderr)
            return jsonify({'error': result.stderr}), 500

        # Find the output JSON file (single_{algorithm}.json or FCFS_integrated.json, etc.)
        json_files = [f for f in os.listdir(INTEGRATION_DIR) if f.endswith('.json') and algorithm.lower() in f.lower()]
        if not json_files:
            json_files = [f for f in os.listdir(INTEGRATION_DIR) if f.endswith('.json')]
        if not json_files:
            return jsonify({'error': 'No output JSON generated'}), 500

        # Pick the latest file
        json_files.sort(key=lambda f: os.path.getmtime(os.path.join(INTEGRATION_DIR, f)), reverse=True)
        output_json_path = os.path.join(INTEGRATION_DIR, json_files[0])
        with open(output_json_path) as f:
            metrics = json.load(f)

        # Run metrics_analyzer.py to generate charts/reports
        try:
            subprocess.run([
                "python", ANALYZER_SCRIPT,
                "--scheduler-outputs", INTEGRATION_DIR,
                "--algorithms", algorithm
            ], cwd=ROOT_DIR)
        except Exception as e:
            print("metrics_analyzer.py error:", str(e))

        # List generated charts and reports
        charts = [f for f in os.listdir(REPORTS_DIR) if f.endswith('.png')]
        pdfs = [f for f in os.listdir(REPORTS_DIR) if f.endswith('.pdf')]

        return jsonify({
            "metrics": metrics,
            "charts": charts,
            "reports": pdfs
        })
    except Exception as e:
        print("API error:", str(e))
        return jsonify({'error': str(e)}), 500

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