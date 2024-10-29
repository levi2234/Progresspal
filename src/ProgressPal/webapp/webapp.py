from flask import Flask, render_template ,request, Response
import time
import logging
import sys
import os
import signal
import argparse
from flask import jsonify
from collections import deque
from webapp_online_check import webapp_online_check


def start_web_server(host="127.0.0.1", port=5000, debug=False, weblog=False, **kwargs):
    
    # Check if the web app is already running
    if webapp_online_check(f"http://{host}:{port}"):
        if weblog:
            print("Website is already running.")
        return

    # Disable logging if weblog is False
    if not weblog:
        disable_logging()

    # Create the Flask application
    webapp = create_flask_app()

    # Start the Flask app
    print(f"Starting the web server on port {port}...")
    run_app(webapp, host, port, debug)

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
    
    
def create_flask_app():
    webapp = Flask(__name__)
    progress_data = {}
    function_data = {}
    

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
            
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "error", "message": "Invalid data"}), 400

    @webapp.route('/progress', methods=['GET'])
    def get_progress():
        return jsonify(progress_data)
    
    @webapp.route('/update_function_status', methods=['POST'])
    def update_function_status():
        data = request.json
        task_id = data.get("task_id")
        category = data.get("category")
        call_count = data.get("call_count")
        last_execution_time = data.get("last_execution_time")
        function_name = data.get("function_name")
        exec_hist = data.get("exec_hist")

        
        # Ensure task_id is valid
        if task_id is not None:
            # If task_id doesn't exist, create a new dictionary for it
            if task_id not in function_data:
                function_data[task_id] = {}
            # Update progress_data with the new values
            if function_data[task_id].get("call_count") is not None:
                function_data[task_id]["call_count"] += call_count
            else:
                function_data[task_id]["call_count"] = call_count
            function_data[task_id]["category"] = category
            function_data[task_id]["last_execution_time"] = last_execution_time
            function_data[task_id]["function_name"] = function_name
            if "exec_hist" in function_data[task_id]:
                function_data[task_id]["exec_hist"].extend(exec_hist) #TODO : make it so that this cannot be more than a certain length 
            else:
                function_data[task_id]["exec_hist"] = exec_hist

            
            
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "error", "message": "Invalid data"}), 400

    @webapp.route('/function_status', methods=['GET'])
    def get_function_status():
        return jsonify(function_data)
    

    
    
    
    return webapp



    
    
#parse the arguments
parser = argparse.ArgumentParser()
parser.add_argument('--host', type=str, default="127.0.0.1", help='Host name for the web server')
parser.add_argument('--port', type=int, default=5000, help='Port number for the web server')
parser.add_argument('--debug', type=bool, default=False, help='Enable debug mode')
parser.add_argument('--weblog', type=bool, default=True, help='Enable web log')
args = parser.parse_args()

# Start the web server
start_web_server(host= args.host, port=args.port, debug=args.debug, weblog=args.weblog)



