import numpy as np
import time
import aiohttp
import asyncio

async def update_progress(task_id, category, iteration, total, percentage, elapsed_time, time_remaining, iterations_per_second, execution_duration, start_time, track_overhead, host="127.0.0.1", port=5000):
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
    
    data = {
        "task_id": task_id,
        "category": category,
        "progress": percentage,
        "iteration": iteration,
        "total": total,
        "elapsed_time": elapsed_time,
        "time_remaining": time_remaining,
        "iterations_per_second": iterations_per_second,
        "start_time": start_time,
        "execution_duration": execution_duration,
        "track_overhead": track_overhead
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=data) as response:
            if response.status == 200:
                return None
class ltrack:
    def __init__(self, iterable, port=5000, host="127.0.0.1", taskid=None, total=None, debug=False, weblog=False, web=True, tickrate=1):
        """
        Initializes the ProgressTracker with the given parameters.
        Args:
            iterable (iterable): The iterable to track.
            port (int, optional): The port number for the web server. Defaults to 5000.
            taskid (int, optional): The task ID for tracking. If None, a random task ID is generated. Defaults to None.
            debug (bool, optional): Whether to run the web server in debug mode. Defaults to False.
            weblog (bool, optional): Whether to enable logging for the web server. Defaults to False.
            web (bool, optional): Whether to update the progress on the web application. Defaults to True.
            tickrate (int, optional): The interval in seconds for updating the progress. Defaults to 1.
        """
        self.iterable = iter(iterable)
        self.port = port
        self.host = host
        self.taskid = taskid if taskid is not None else np.random.randint(10000)
        self.total = total if total is not None else (len(iterable) if hasattr(iterable, '__len__') else None)
        if self.total is None:
            raise ValueError("Total length must be provided for generator functions")
        self.debug = debug
        self.weblog = weblog
        self.web = web
        self.tickrate = tickrate
        self.start_time = time.time()
        self.next_update = self.start_time + self.tickrate
        self.iterable_type_origin = type(iterable).__module__
        self.track_overhead = 0
        self.last_call = time.perf_counter_ns()
        self.iteration = 0

    def _update_progress(self, execution_duration):
        """
        Updates the progress of the current task.
        This method calculates the elapsed time, iterations per second, time remaining,
        start time in human-readable format, and percentage of completion. It then
        sends this progress information to an external service using asyncio.
        Args:
            execution_duration (float): The duration of the current execution cycle.
        Raises:
            Exception: If there is an error while updating the progress, it is caught and passed.
        """
        elapsed_time = time.time() - self.start_time
        iterations_per_second = self.iteration / elapsed_time if elapsed_time > 0 else float('inf')
        time_remaining = (self.total - self.iteration) / iterations_per_second if iterations_per_second > 0 else 0
        start_time_human = time.ctime(self.start_time)
        percentage = round((self.iteration / self.total * 100), 2) if self.total > 0 else 0

        try:
            asyncio.run(update_progress(self.taskid, self.iterable_type_origin, self.iteration, self.total, percentage, elapsed_time, time_remaining, iterations_per_second, execution_duration, start_time_human, self.track_overhead, host=self.host, port=self.port))
            self.next_update += self.tickrate
            return None
        except Exception as e:
           return None
            

    def __iter__(self):
        return self

    def __next__(self):
        """
        Advances to the next item in the iterable, tracking execution time and overhead.
        This method times the duration of each iteration and updates progress if the web option is enabled.
        It also calculates the overhead of tracking after yielding the item.
        Returns:
            The next item from the iterable.
        Raises:
            StopIteration: If there are no more items in the iterable.
        """
        try:
            
            start_time_loop = time.perf_counter_ns()  # Start timing for the iteration
            
            item = next(self.iterable)
            end_time_loop_item = time.perf_counter_ns()  # End timing immediately after yielding

            self.iteration += 1

            # Calculate execution duration specific to yielding the item
            execution_duration = end_time_loop_item - self.last_call
            self.last_call = end_time_loop_item

            # If using web, update progress at defined intervals
            if self.web and time.time() >= self.next_update:
                self._update_progress(execution_duration)

            # Calculate tracking overhead after yielding
            end_time_loop = time.perf_counter_ns()
            self.track_overhead = end_time_loop - end_time_loop_item

            return item
        except StopIteration:
            raise StopIteration

# Example usage:
# for item in ProgressTracker(your_iterable):
#     # process item


        
        # print(f"Yield: {end_time_loop - start_time_loop} Functionality:  {end_time_loop2 - end_time_loop}") # Debugging extra time taken for each iteration