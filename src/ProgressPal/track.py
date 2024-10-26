from .webapp.start_server import start_server
from .webapp.webapp_online_check import webapp_online_check
import requests 
import numpy as np
import time


def update_progress(task_id, category, iteration, total, percentage,elapsed_time, time_remaining, iterations_per_second, start_time, host="127.0.0.1", port=5000):
    
    """
        Update the progress of a task by sending a POST request to a specified server.
        Args:
            task_id (str): The unique identifier of the task.
            iteration (int): The current iteration number.
            total (int): The total number of iterations.
            percentage (float): The completion percentage of the task.
            elapsed_time (float): The elapsed time since the task started.
            time_remaining (float): The estimated time remaining to complete the task.
            iterations_per_second (float): The rate of iterations per second.
            host (str, optional): The server host. Defaults to "127.0.0.1".
            port (int, optional): The server port. Defaults to 5000.
        Returns:
            None
        """
    url = f"http://{host}:{port}/update_progress"
    
    data = {"task_id": task_id,"category": category, "progress": percentage, "iteration": iteration,
            "total": total, "elapsed_time": elapsed_time, "time_remaining": time_remaining,
            "iterations_per_second": iterations_per_second, "start_time": start_time}
    
    response = requests.post(url, json=data)
    if response.status_code == 200:
        print(f"Updated progress: {percentage}%")
    else:
        print("Failed to update progress")
    


def track(iterable, port=5000, taskid= None, category=0,  debug=False, weblog=False, web = True, command_line = False, tickrate =1,  **kwargs):
    def track(iterable, port=5000, taskid=None, debug=False, weblog=False, web=True, command_line=False, **kwargs):
        """
        Tracks the progress of an iterable and optionally updates a web application and/or command line with the progress.
        Args:
            iterable (iterable): The iterable to track.
            port (int, optional): The port number for the web server. Defaults to 5000.
            taskid (int, optional): The task ID for tracking. If None, a random task ID is generated. Defaults to None.
            debug (bool, optional): Whether to run the web server in debug mode. Defaults to False.
            weblog (bool, optional): Whether to enable logging for the web server. Defaults to False.
            web (bool, optional): Whether to update the progress on the web application. Defaults to True.
            command_line (bool, optional): Whether to update the progress on the command line. Defaults to False.
            **kwargs: Additional keyword arguments to pass to the web server.
        Yields:
            item: The next item from the iterable.
        Raises:
            Exception: If there is an error updating the progress on the web application.
        """
        
    #---------------------Check if the web server is online---------------------
    if not webapp_online_check(f"http://127.0.0.1:{port}") and web:
        # Start the web server in a separate process
        start_server(port=port, debug=debug, weblog=weblog, **kwargs)
        pass 
    
    # ---------------------Set up the progress tracking---------------------
    if taskid == None: rand_task_id = np.random.randint(10000)
    else: rand_task_id = taskid
    
    total = len(iterable)
    start_time = time.time()
    start_time_human = str(time.ctime())
    last_tick_time = start_time
    
    # ---------------------Handle the iterable---------------------
    for i, item in enumerate(iterable):
        yield item
        
        # ---------------------Calculate the progress properties---------------------
        iteration = i + 1
        percentage = round(((i + 1) / total * 100),2)
        elapsed_time = time.time() - start_time
        iterations_per_second = round(iteration / elapsed_time,2)
        time_remaining = (total - iteration) / iterations_per_second
        
        
        
        # ---------------------Update the progress---------------------
        # Update the progress on the web app
        if web:
            try:
                if time.time() - last_tick_time > tickrate: # Update the progress every tickrate seconds (set to 1 sec by default)
                    last_tick_time = time.time()
                    update_progress(rand_task_id,category, iteration, total, percentage,elapsed_time, time_remaining, iterations_per_second, start_time_human)
            except Exception as e:
                pass
        
        
        #Update the progress on the command line
        if command_line:
            print(f"\r\033[K Progress: {percentage}% - Elapsed time: {elapsed_time:.2f}s - Remaining time: {time_remaining:.2f}s", end="")
        
