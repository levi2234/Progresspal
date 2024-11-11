import pytest
from unittest.mock import patch, MagicMock
from ProgressPal import ftrack
import time
import numpy as np
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

@ftrack()
def function():
    print("Hello World")
    time.sleep(5)
    return True

@ftrack()
def function_with_args(arg1, arg2):
    return arg1 + arg2

@ftrack()
def function_with_exception():
    raise ValueError("Test exception")

def test_ftrack_wraps_function():
    result = function()
    assert result == True

def test_ftrack_handles_exceptions():
    with pytest.raises(ValueError, match="Test exception"):
        function_with_exception()

def test_ftrack_with_different_return_values():
    @ftrack()
    def return_string():
        return "Hello"
    
    @ftrack()
    def return_list():
        return [1, 2, 3]
    
    assert return_string() == "Hello"
    assert return_list() == [1, 2, 3]

def test_ftrack_with_function_arguments():
    result = function_with_args(1, 2)
    assert result == 3

def test_ftrack_with_numpy_array():
    @ftrack()
    def sum_numpy_array(arr):
        return np.sum(arr)
    
    arr = np.array([1, 2, 3, 4, 5])
    result = sum_numpy_array(arr)
    assert result == 15

def test_ftrack_with_threading():
    result = []

    @ftrack()
    def threaded_function():
        result.append(True)
    
    thread = threading.Thread(target=threaded_function)
    thread.start()
    thread.join()

    assert result == [True]

def test_ftrack_with_threadpool_executor():
    results = []

    @ftrack()
    def threadpool_function():
        return True

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(threadpool_function) for _ in range(5)]
        for future in as_completed(futures):
            results.append(future.result())

    assert results == [True] * 5

def test_ftrack_with_different_iterables():
    @ftrack()
    def sum_iterable(iterable):
        return sum(iterable)
    
    assert sum_iterable([1, 2, 3]) == 6
    assert sum_iterable((1, 2, 3)) == 6
    assert sum_iterable(range(4)) == 6
    assert sum_iterable(np.array([1, 2, 3])) == 6