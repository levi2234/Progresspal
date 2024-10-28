
import requests 
from functools import wraps
import time
from collections import deque
from numpy import random as np
import os


def update_function_progress(task_id, category, call_count,last_execution_time,function_name,exec_hist,host,port):

    url = f"http://{host}:{port}/update_function_status"
    
    data = {"task_id": task_id,
            "category": category,
            "call_count": call_count,
            "last_execution_time": last_execution_time,
            "function_name": function_name,
            "exec_hist": exec_hist if exec_hist else None,
            }
    
    response = requests.post(url, json=data)
    if response.status_code == 200:
        return None




def ftrack(port=5000, host="127.0.0.1", taskid=None, category=0, web=True, command_line=False, tickrate=1, startweb=False, exec_hist=False, **kwargs):
    def decorator(func):
        @wraps(func)
        
        def wrapper(*args, **kwargs):
            
            if not hasattr(wrapper, 'exec_history') and exec_hist:  # Initialize the execution history
                wrapper.exec_history = deque(maxlen=exec_hist)
                
                
            start_time_execution = time.perf_counter_ns()
            function = func(*args, **kwargs)
            execution_duration = time.perf_counter_ns() - start_time_execution
            if web or command_line:  # Calculate the function information
                wrapper.call_count = 1
                latest_call = time.ctime()
                function_name = func.__name__
                if exec_hist:
                    wrapper.exec_history.appendleft(execution_duration)
                

                #Send the progress update
                
                if web:
                    update_function_progress(task_id=taskid if taskid is not None else os.path.basename(__file__),
                                             category=category,
                                             call_count=wrapper.call_count,
                                             last_execution_time=latest_call,
                                             function_name=function_name,
                                             exec_hist=list(wrapper.exec_history) if exec_hist else None,
                                             host=host,
                                             port=port)
                    print(wrapper.exec_history, wrapper.call_count)
                    
                    
                else: 
                    wrapper.call_count += 1
            
            return function
        
        
        
        
        # Initialize the call count attribute
        wrapper.call_count = 0
        wrapper.first_call_time = time.time()
        wrapper.last_execution_time = time.time()
        return wrapper
        
    return decorator


# Using the decorator
@ftrack(exec_hist=10, taskid= str(os.path.basename(__file__)))
def example_function():
    return None
    
example_function()
example_function()
