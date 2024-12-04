
import time
from collections import deque
from functools import wraps
import os
import inspect
import asyncio
import aiohttp

async def update_function_progress(task_id, category, call_count, last_execution_time, function_name, exec_hist, error_count, filename, calls_per_second, host, port):
    """
    Asynchronously updates the progress of a function execution on a remote server.
    Args:
        task_id (str): The unique identifier of the task.
        category (str): The category of the task.
        call_count (int): The number of times the function has been called.
        last_execution_time (float): The time taken for the last execution of the function.
        function_name (str): The name of the function being tracked.
        exec_hist (list): The execution history of the function.
        error_count (int): The number of errors encountered during execution.
        filename (str): The name of the file where the function is defined.
        calls_per_second (float): The rate of function calls per second.
        host (str): The host address of the remote server.
        port (int): The port number of the remote server.
    Returns:
        None: If the update is successful or if an error occurs during the request.
    """
    url = f"http://{host}:{port}/update_function_status"
    
    data = {
        "task_id": task_id,
        "category": category,
        "call_count": call_count,
        "error_count": error_count,
        "last_execution_time": last_execution_time,
        "function_name": function_name,
        "exec_hist": exec_hist if exec_hist else None,
        "filename": filename,   
        "calls_per_second": calls_per_second
    }
    try: 
        async with aiohttp.ClientSession() as session:  # Create a new session for each request
            async with session.post(url, json=data) as response: # Send a POST request to the server
                if response.status == 200:
                    return None
    except aiohttp.ClientError as e:
        return None
        
class ftrack:
    """
    A decorator class to track the execution of functions, including execution time, error count, and call count.
    Optionally, it can send updates to a web server.
    Attributes:
        port (int): The port number for the web server. Default is 5000.
        host (str): The host address for the web server. Default is "127.0.0.1".
        taskid (str): An optional task identifier.
        category (int): An optional category identifier. Default is 0.
        web (bool): If True, sends updates to a web server. Default is True.
        command_line (bool): If True, enables command line mode. Default is False.
        tickrate (int): The rate at which updates are sent to the web server. Default is 1.
        exec_hist (deque): A deque to store execution history with a maximum length.
        first_call_time (float): The time when the first call was made.
        kwargs (dict): Additional keyword arguments.
        latest_call (float): The time of the latest call.
        call_count (int): The number of times the decorated function has been called.
        error_count (int): The number of errors encountered during function execution.
        file_name (str): The name of the file where the decorator is used.
    Methods:
        __call__(func):
            Decorates the given function to track its execution.
        async run_update(func, duration):
            Sends an update to the web server with the function's execution details.
    """
    def __init__(self, port=5000, host="127.0.0.1", taskid=None, category=0, web=True, command_line=False, tickrate=1, exec_hist=100, **kwargs):
        self.port = port
        self.host = host
        self.taskid = taskid
        self.category = category
        self.web = web
        self.command_line = command_line
        self.tickrate = tickrate
        self.exec_hist = deque(maxlen=exec_hist)
        self.first_call_time = time.perf_counter()
        self.kwargs = kwargs
        self.latest_call = None
        self.call_count = 0
        self.error_count = 0
        self.file_name = os.path.basename(inspect.stack()[1].filename)

    def __call__(self, func):
        """
        A decorator that wraps a function to track its execution statistics.

        Args:
            func (Callable): The function to be wrapped.

        Returns:
            Callable: The wrapped function with added tracking functionality.

        The wrapper function performs the following tasks:
            - Increments the call count each time the function is called.
            - Records the start time of the function execution.
            - Executes the function and captures any exceptions, incrementing the error count if an exception occurs.
            - Records the execution duration and appends it to the execution history.
            - If the web attribute is True and the call count is a multiple of the tickrate, it runs an asynchronous update function.
        """
        @wraps(func)
        def wrapper(*args, **kwargs):
            self.call_count += 1
            start_time_execution = time.perf_counter_ns()
            try:
                result = func(*args, **kwargs)
            except Exception as e:
                self.error_count += 1
                print(f"Error in {func.__name__}: {e}")
                raise
            finally:
                execution_duration = time.perf_counter_ns() - start_time_execution
                self.exec_hist.append(execution_duration)
            if self.web and self.call_count % self.tickrate == 0:
                self.latest_call = execution_duration
                
                # Schedule the update function as a background task
                
                
                loop = asyncio.get_event_loop()
                if loop.is_running(): # If the event loop is already running, create a task in order to run the update function in the background
                    asyncio.create_task(self.run_update(func)) # Run the update function in the background 
                else: # If the event loop is not running, run it synchronously
                    loop.run_until_complete(self.run_update(func)) # Run the update function synchronously
            return result
        return wrapper

    async def run_update(self, func):
            asyncio.create_task( update_function_progress(
                task_id=self.taskid or func.__name__,
                category=self.category,
                call_count=self.call_count,
                last_execution_time=self.latest_call,
                function_name=func.__name__,
                exec_hist=list(self.exec_hist),
                error_count=self.error_count,
                filename=self.file_name,
                calls_per_second=self.call_count / (time.perf_counter() - self.first_call_time),
                host=self.host,
                port=self.port
            ))


