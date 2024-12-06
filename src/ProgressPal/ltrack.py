import time
import threading
import requests
import numpy as np

def update_progress_http(task_id, category, iteration, total, percentage, elapsed_time, time_remaining, 
                         iterations_per_second, execution_duration, start_time, track_overhead, 
                         host="127.0.0.1", port=5000):
    """
    Thread-safe function to send progress updates via HTTP POST.
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
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()  # Raise an error for HTTP errors
    except requests.RequestException as e:
        pass

class ltrack:
    def __init__(self, iterable, port=5000, host="127.0.0.1", taskid=None, total=None, debug=False, 
                 weblog=False, web=True, tickrate=1):
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
        self.lock = threading.Lock()  # Thread safety for shared state

    def _update_progress(self, execution_duration):
        """
        Sends a progress update. Thread-safe due to the lock.
        """
        with self.lock:
            elapsed_time = time.time() - self.start_time
            iterations_per_second = self.iteration / elapsed_time if elapsed_time > 0 else float('inf')
            time_remaining = (self.total - self.iteration) / iterations_per_second if iterations_per_second > 0 else 0
            start_time_human = time.ctime(self.start_time)
            percentage = round((self.iteration / self.total * 100), 2) if self.total > 0 else 0

        # Send the update using a thread-safe HTTP client
        threading.Thread(
            target=update_progress_http,
            args=(
                self.taskid, self.iterable_type_origin, self.iteration, self.total, percentage, elapsed_time, 
                time_remaining, iterations_per_second, execution_duration, start_time_human, self.track_overhead, 
                self.host, self.port
            ),
            daemon=True
        ).start()

    def __iter__(self):
        return self

    def __next__(self):
        try:
            start_time_loop = time.perf_counter_ns()
            item = next(self.iterable)
            end_time_loop_item = time.perf_counter_ns()

            self.iteration += 1

            execution_duration = end_time_loop_item - self.last_call
            self.last_call = end_time_loop_item

            if self.web and time.time() >= self.next_update:
                self._update_progress(execution_duration)
                self.next_update += self.tickrate

            end_time_loop = time.perf_counter_ns()
            self.track_overhead = end_time_loop - end_time_loop_item

            return item
        except StopIteration:
            raise