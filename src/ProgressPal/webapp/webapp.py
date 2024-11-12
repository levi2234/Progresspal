from flask import Flask, render_template ,request, Response
import logging
import sys
import os
import json
import signal
from flask import jsonify
from .webapp_online_check import webapp_online_check
from waitress import serve

def start_web_server(host="127.0.0.1", port=5000, debug=False, verbose=False, **kwargs):
    # Check if the web app is already running
    print(f"Checking if the website is already running on http://{host}:{port}...")
    if webapp_online_check(f"http://{host}:{port}"):
        if verbose:
            print("Website is already running.")
        return

    # Disable logging if weblog is False
    if ~verbose:
        disable_logging()

    # Create the Flask application
    webapp = create_flask_app()

    # Start the Flask app
    if debug:
        print(f"Starting the DEBUG web server on http://{host}:{port}...")
        run_app(webapp, host, port, debug)
    else:
        print(f"Starting the PRODUCTION server on http://{host}:{port}...")
        serve(webapp, host=host, port=port, threads=4)

def disable_logging():
    log = logging.getLogger('werkzeug')
    log.disabled = True
    cli = sys.modules['flask.cli']
    cli.show_server_banner = lambda *x: None


def shutdown_server():
    # Sends a signal to the current process to terminate it
    os.kill(os.getpid(), signal.SIGINT)

def run_app(webapp, host, port, debug):
    webapp.run(host=host, port=port, debug=debug, use_reloader=False)
    
    
def calculate_mean_std_execution_time(exec_time_stats, new_exec_time):
    n = exec_time_stats["n"]
    mean = exec_time_stats["mean"]
    std = exec_time_stats["std"]
    
    n += 1
    
    if n == 1:
        mean = new_exec_time
        std = 0
    else:
        old_mean = mean
        mean = old_mean + (new_exec_time - old_mean) / n
        # Update the variance
        std = ((std ** 2 * (n - 1)) + (new_exec_time - old_mean) * (new_exec_time - mean)) / n
    
    exec_time_stats["n"] = n
    exec_time_stats["mean"] = mean
    exec_time_stats["std"] = std ** 0.5  # Return the standard deviation instead of variance
    return exec_time_stats
    
    
    
def create_flask_app():
    webapp = Flask(__name__)
    progress_data = {}
    function_data = {}
    log_data = {}
    

    @webapp.route('/')
    def home():
        return render_template("index.html")

    @webapp.route('/shutdown', methods=['POST'])
    def shutdown():
        shutdown_server()
        return jsonify({"message": "Server shutting down..."}), 200
    
    
    @webapp.route('/update_progress', methods=['POST'])
    def update_progress():
        data = request.json
        task_id = data.get("task_id")
        category = data.get("category")
        iteration = data.get("iteration")
        total = data.get("total")
        progress = data.get("progress")
        elapsed_time = data.get("elapsed_time")
        time_remaining = data.get("time_remaining")
        iterations_per_second = data.get("iterations_per_second")
        start_time = data.get("start_time")
        track_overhead = data.get("track_overhead")
        execution_duration = data.get("execution_duration")


        
        # Ensure task_id is valid
        if task_id is not None:
            # If task_id doesn't exist, create a new dictionary for it
            if task_id not in progress_data:
                progress_data[task_id] = {}
            
            # Update progress_data with the new values
            progress_data[task_id]["iteration"] = iteration
            progress_data[task_id]["category"] = category
            progress_data[task_id]["total"] = total
            progress_data[task_id]["progress"] = progress
            progress_data[task_id]["elapsed_time"] = elapsed_time
            progress_data[task_id]["time_remaining"] = time_remaining
            progress_data[task_id]["iterations_per_second"] = iterations_per_second
            progress_data[task_id]["start_time"] = start_time
            progress_data[task_id]["track_overhead"] = track_overhead
            progress_data[task_id]["execution_duration"] = execution_duration

            
            progress_data[task_id]["exec_time_stats"] = calculate_mean_std_execution_time(progress_data[task_id].get("exec_time_stats", {"n": 0, "mean": 0, "std": 0}), execution_duration)

            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "error", "message": "Invalid data"}), 400
        
        

    @webapp.route('/remove_completed_iterables', methods=['POST'])
    def remove_completed_iterables():
        # Remove completed iterables from the progress_data dictionary
        completed_iterables = [task_id for task_id in progress_data if progress_data[task_id]["progress"] >= 100]
        for task_id in completed_iterables:
            del progress_data[task_id]
        return jsonify({"status": "success", "removed": completed_iterables})
        

    @webapp.route('/progress', methods=['GET'])
    def get_progress():
        return jsonify(progress_data)
    
    @webapp.route('/update_function_status', methods=['POST'])
    def update_function_status():
        data = request.json
        task_id = data.get("task_id")
        category = data.get("category")
        call_count = data.get("call_count")
        error_count = data.get("error_count")
        last_execution_time = data.get("last_execution_time")
        function_name = data.get("function_name")
        exec_hist = data.get("exec_hist")
        filename = data.get("filename")
        calls_per_second = data.get("calls_per_second")
        

        
        # Ensure task_id is valid
        if task_id is not None:
            # If task_id doesn't exist, create a new dictionary for it
            if task_id not in function_data:
                function_data[task_id] = {}
            # Update progress_data with the new values
            if function_data[task_id].get("call_count") is not None:
                function_data[task_id]["call_count"] = call_count
            else:
                function_data[task_id]["call_count"] = call_count
            function_data[task_id]["category"] = category
            function_data[task_id]["last_execution_time"] = last_execution_time
            function_data[task_id]["function_name"] = function_name
            function_data[task_id]["exec_hist"] = exec_hist
            function_data[task_id]["filename"] = filename
            function_data[task_id]["error_count"] = error_count
            function_data[task_id]["calls_per_second"] = calls_per_second
            
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "error", "message": "Invalid data"}), 400

    @webapp.route('/function_status', methods=['GET'])
    def get_function_status():
        return jsonify(function_data)
    
    @webapp.route('/update_logs', methods=['POST'])
    def update_logs():
        data = request.json
        message = data.get("message")
        level = data.get("level")
        timestamp = data.get("timestamp")
        filename = data.get("filename")
        lineno = data.get("lineno")
        
        # add log to the log json
        log = {
            "message": message,
            "level": level,
            "timestamp": timestamp,
            "filename": filename,
            "lineno": lineno
        }
        if "logs" not in log_data:
            log_data["logs"] = []
        log_data["logs"].append(log)
        # Save the log to a file
        return jsonify({"status": "success"}), 200
    
    @webapp.route('/logs', methods=['GET'])
    def get_logs():
        return jsonify(log_data)
    
    @webapp.route('/clear_logs', methods=['POST'])
    def clear_logs():
        log_data["logs"] = []
        return jsonify({"status": "success"}), 200
    
    @webapp.route('/clear_progress', methods=['POST'])
    def clear_progress():
        progress_data = {}
        return jsonify({"status": "success"}), 200
    
    @webapp.route('/clear_function_status', methods=['POST'])
    def clear_function_status():
        function_data = {}
        return jsonify({"status": "success"}), 200
    
    
    @webapp.route("/update_settings", methods=['POST'])
    def update_settings():
        data = request.json
        # get path to current directory
        current_dir = os.path.dirname(os.path.realpath(__file__))
        settingspath = os.path.join(current_dir, "static/settings/settings.json")

        try:
            with open(settingspath, "w") as f:
                json.dump(data, f)
            return jsonify({"status": "success"}), 200
        except (IOError, json.JSONDecodeError) as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        
    @webapp.route("/settings", methods=['GET'])
    def get_settings():
        # get path to current directory
        current_dir = os.path.dirname(os.path.realpath(__file__))
        settingspath = os.path.join(current_dir, "static/settings/settings.json")
        try:
            with open(settingspath, "r") as f:
                data = json.load(f)
            return jsonify(data)
        except (IOError, json.JSONDecodeError) as e:
            return jsonify({"status": "error", "message": str(e)}), 500

                
    return webapp
