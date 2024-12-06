import time
from collections import deque
from functools import wraps
import os
import inspect
import threading
import requests
import pickle

def update_function_progress(task_id, category, call_count, last_execution_time, function_name, exec_hist, error_count, filename, calls_per_second, host, port):
    """
    Updates the progress of a function by sending a POST request to a specified server.

    Parameters:
    task_id (str): The unique identifier for the task.
    category (str): The category of the task.
    call_count (int): The number of times the function has been called.
    last_execution_time (float): The time taken for the last execution of the function.
    function_name (str): The name of the function being tracked.
    exec_hist (list): The execution history of the function.
    error_count (int): The number of errors encountered during execution.
    filename (str): The name of the file where the function is located.
    calls_per_second (float): The rate at which the function is being called.
    host (str): The hostname of the server to send the update to.
    port (int): The port number of the server to send the update to.

    Returns:
    None: If the request is successful or if an exception occurs.
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
        response = requests.post(url, json=data)
        if response.status_code == 200:
            return None
    except requests.RequestException as e:
        return None

class ftrack:
        def __init__(self, func=None, port=5000, host="127.0.0.1", taskid=None, category=0, web=True, command_line=False, tickrate=1, exec_hist=100, **kwargs):
            self.func = func
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
            self.lock = threading.Lock()
            self.initialized = False
    
            # If the the first argument is a function, call the decorator with the function as an argument (allows for use as a decorator and a function)
            if func is not None:
                if callable(func):
                    self.func = func
                    self.__call__(func)
                else:
                    raise ValueError("The first argument must be a callable function.")
            else:
                self.func = None
                
            self.initialized = True
                
                
        def calllogic(self,func, *args, **kwargs):
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
                threading.Thread(
                    target=self.run_update,
                    args=(func,),
                    daemon=True
                ).start()
            return result
            
                
    
        def __call__(self, *args, **kwargs):
            
            if self.func is not None and self.initialized:
                return self.calllogic(self.func, *args, **kwargs)
            else:
                func = args[0]
                @wraps(func)
                def wrapper(*args, **kwargs):
                    return self.calllogic(func, *args, **kwargs)
                return wrapper

        def run_update(self, func):
            """
            Run the update function with a lock to ensure thread safety.
        
            This method updates the function progress by calling `update_function_progress` 
            with various attributes of the object and the provided function.
        
            Args:
                func (function): The function whose progress is being updated.
            """
            with self.lock:
                update_function_progress(
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
                )
    
        def __getstate__(self):
            """
            Prepare the object state for pickling.
        
            This method is called when the object is being pickled. It creates a copy of the 
            object's __dict__ and sets the 'lock' attribute to None because locks cannot be pickled.
        
            Returns:
                dict: The state of the object with 'lock' set to None.
            """
            state = self.__dict__.copy()
            state['lock'] = None  # Locks cannot be pickled
            return state
        
        def __setstate__(self, state):
            """
            Restore the object state from the unpickled state.
        
            This method is called when the object is being unpickled. It updates the object's 
            __dict__ with the unpickled state and recreates the 'lock' attribute.
        
            Args:
                state (dict): The unpickled state of the object.
            """
            self.__dict__.update(state)
            self.lock = threading.Lock()  # Recreate the lock after unpickling