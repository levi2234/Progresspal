
import time
from collections import deque
from functools import wraps
import os
import inspect
import asyncio
import aiohttp

async def update_function_progress(task_id, category, call_count, last_execution_time, function_name, exec_hist, error_count, filename, calls_per_second, host, port):
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
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data) as response:
                if response.status == 200:
                    return None
    except aiohttp.ClientError as e:
        return None
        
class ftrack:
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
        @wraps(func)
        def wrapper(*args, **kwargs):
            self.call_count += 1
            start_time_execution = time.perf_counter_ns()  # Start the timer for the function execution
            
            try:
                # Execute the function
                function = func(*args, **kwargs)
            except Exception as e:
                self.error_count += 1
                raise e
            finally:
                execution_duration = time.perf_counter_ns() - start_time_execution  # Calculate the execution duration
                self.latest_call = time.ctime()
                self.exec_hist.append(execution_duration)
                
                # Send the progress update
                if self.web:
                    asyncio.run(self.run_update(func, execution_duration))
    
            return function
    
        return wrapper

    async def run_update(self, func,  execution_duration):
        await update_function_progress(
            task_id= self.taskid if self.taskid is not None else func.__name__,
            category=self.category,
            call_count=self.call_count,
            last_execution_time=self.latest_call,
            function_name=func.__name__,
            exec_hist=list(self.exec_hist),
            error_count=self.error_count, 
            filename = self.file_name,
            calls_per_second=self.call_count / (time.perf_counter() - self.first_call_time),
            host=self.host,
            port=self.port
        )
    

