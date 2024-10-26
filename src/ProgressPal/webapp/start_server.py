import subprocess
import os



def start_server(host="127.0.0.1", port=5000, debug=False, weblog=False):
    # Prepare the command to run the web server
        # Get the absolute path of the directory where this module is located
    module_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct the path to webapp.py relative to this module
    webapp_path = os.path.join(module_dir, 'webapp.py')
    
    # Prepare the command to run the web server
    command = ['python', webapp_path,'--host', str(host), '--port', str(port), '--debug', str(debug), '--weblog', str(weblog)]

    # Start the web server process
    web_server_process = subprocess.Popen(command, start_new_session=True)
    
    # Optionally log the process ID
    if weblog:
        print(f"Web server started with PID: {web_server_process.pid}")
    
    return web_server_process


