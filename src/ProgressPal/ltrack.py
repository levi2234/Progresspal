from .webapp.start_server import start_server
from .webapp.webapp_online_check import webapp_online_check
import requests 
import numpy as np
import time


def update_progress(task_id, category, iteration, total, percentage ,elapsed_time, time_remaining, iterations_per_second, execution_duration, start_time, track_overhead, host="127.0.0.1", port=5000):
    
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
    
    data = {"task_id": task_id,
            "category": category,
            "progress": percentage, 
            "iteration": iteration,
            "total": total, 
            "elapsed_time": elapsed_time, 
            "time_remaining": time_remaining,
            "iterations_per_second": iterations_per_second, 
            "start_time": start_time,
            "execution_duration": execution_duration,
            "track_overhead": track_overhead}
    
    response = requests.post(url, json=data)
    if response.status_code == 200:
        return None
    # else:
    #     print("Failed to update progress")
    
def ltrack(iterable, port=5000, host= "127.0.0.1",  taskid=None, total=None, debug=False, weblog=False, web=True, tickrate=1): 
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
    # Progress tracking setup
    rand_task_id = taskid if taskid is not None else np.random.randint(10000)
    
    if total is None:
        if hasattr(iterable, '__len__'):
            total = len(iterable)
        else:
            raise ValueError("Total length must be provided for generator functions")

    start_time = time.time()
    next_update = start_time + tickrate
    iterable_type_origin = type(iterable).__module__
    track_overhead = 0
    
    
    for i, item in enumerate(iterable):
        # Debugging extra time taken for each iteration
        start_time_loop = time.perf_counter_ns()
        yield item
        # Debugging extra time taken for each iteration
        end_time_loop_item = time.perf_counter_ns()
        
        iteration = i + 1
        percentage = round((iteration / total * 100), 2) if total > 0 else 0

        if web and time.time() >= next_update: # Update progress on web app if tickrate interval has passed
            elapsed_time = time.time() - start_time # Calculate elapsed time
            iterations_per_second = iteration / elapsed_time if elapsed_time > 0 else float('inf') # Calculate iterations per second
            time_remaining = (total - iteration) / iterations_per_second if iterations_per_second > 0 else 0 # Calculate remaining time
            start_time_human = time.ctime(start_time)   # Convert start time to human-readable format
            execution_duration = end_time_loop_item - start_time_loop

            try:
                update_progress(rand_task_id, iterable_type_origin, iteration, total, percentage, elapsed_time, time_remaining, iterations_per_second, execution_duration, start_time_human, track_overhead, host=host, port=port)
                next_update += tickrate
            except Exception as e:
                pass
        
        track_overhead = time.perf_counter_ns() - end_time_loop_item 
    


        
        # print(f"Yield: {end_time_loop - start_time_loop} Functionality:  {end_time_loop2 - end_time_loop}") # Debugging extra time taken for each iteration