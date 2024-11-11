import pytest
from unittest.mock import patch, MagicMock
from ProgressPal import ltrack
import pandas as pd
import numpy as np
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

def test_ltrack_yields_items():
    iterable = [1, 2, 3, 4, 5]
    result = list(ltrack(iterable))
    assert result == iterable

@patch('ProgressPal.ltrack.update_progress')
def test_ltrack_updates_progress(mock_update_progress):
    iterable = [1, 2, 3]
    list(ltrack(iterable, tickrate=0))
    assert mock_update_progress.called

@patch('ProgressPal.ltrack.update_progress')
def test_ltrack_handles_update_exception(mock_update_progress):
    mock_update_progress.side_effect = Exception("Test exception")
    iterable = [1, 2, 3]
    try:
        list(ltrack(iterable, tickrate=0))
    except Exception:
        pytest.fail("ltrack raised Exception unexpectedly!")

def test_ltrack_yields_correct_data_types():
    iterable = [1, 2, 3, 4, 5]
    result = list(ltrack(iterable))
    assert all(isinstance(item, int) for item in result)

def test_ltrack_with_empty_iterable():
    iterable = []
    result = list(ltrack(iterable))
    assert result == []

def test_ltrack_with_non_integer_iterable():
    iterable = ['a', 'b', 'c']
    result = list(ltrack(iterable))
    assert result == iterable

def test_ltrack_with_large_iterable():
    iterable = range(10000)
    result = list(ltrack(iterable))
    assert result == list(iterable)

def test_ltrack_with_custom_task_id():
    iterable = [1, 2, 3]
    task_id = 12345
    result = list(ltrack(iterable, taskid=task_id))
    assert result == iterable

def test_ltrack_with_custom_total():
    iterable = [1, 2, 3]
    total = 10
    result = list(ltrack(iterable, total=total))
    assert result == iterable

def test_ltrack_with_custom_tickrate():
    iterable = [1, 2, 3]
    tickrate = 2
    result = list(ltrack(iterable, tickrate=tickrate))
    assert result == iterable

def test_ltrack_with_custom_host_and_port():
    iterable = [1, 2, 3]
    host = "192.168.1.1"
    port = 8080
    result = list(ltrack(iterable, host=host, port=port))
    assert result == iterable

def test_ltrack_with_debug_mode():
    iterable = [1, 2, 3]
    result = list(ltrack(iterable, debug=True))
    assert result == iterable

def test_ltrack_with_weblog_enabled():
    iterable = [1, 2, 3]
    result = list(ltrack(iterable, weblog=True))
    assert result == iterable
def test_ltrack_with_list():
    iterable = [1, 2, 3, 4, 5]
    result = list(ltrack(iterable))
    assert result == iterable



#TEST DATA TYPES
def test_ltrack_with_numpy_array():
    iterable = np.array([1, 2, 3, 4, 5])
    result = list(ltrack(iterable))
    assert np.array_equal(result, iterable)

def test_ltrack_with_tuple():
    iterable = (1, 2, 3, 4, 5)
    result = list(ltrack(iterable))
    assert result == list(iterable)

def test_ltrack_with_pandas_dataframe():
    iterable = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})
    result = list(ltrack(iterable.iterrows(), total=len(iterable)))
    assert len(result) == len(iterable)
    for (index, row), (expected_index, expected_row) in zip(result, iterable.iterrows()):
        assert index == expected_index
        pd.testing.assert_series_equal(row, expected_row)

def test_ltrack_with_pandas_series():
    iterable = pd.Series([1, 2, 3, 4, 5])
    result = list(ltrack(iterable))
    assert result == list(iterable)
def test_ltrack_with_set():
    iterable = {1, 2, 3, 4, 5}
    result = list(ltrack(iterable))
    assert set(result) == iterable

def test_ltrack_with_dict_keys():
    iterable = {'a': 1, 'b': 2, 'c': 3}.keys()
    result = list(ltrack(iterable))
    assert result == list(iterable)

def test_ltrack_with_dict_values():
    iterable = {'a': 1, 'b': 2, 'c': 3}.values()
    result = list(ltrack(iterable))
    assert result == list(iterable)

def test_ltrack_with_dict_items():
    iterable = {'a': 1, 'b': 2, 'c': 3}.items()
    result = list(ltrack(iterable))
    assert result == list(iterable)

def test_ltrack_with_string():
    iterable = "abcdef"
    result = list(ltrack(iterable))
    assert result == list(iterable)

def test_ltrack_with_generator():
    iterable = (x for x in range(5))
    result = list(ltrack(iterable, total=5))
    assert result == list(range(5))

def test_ltrack_with_range():
    iterable = range(5)
    result = list(ltrack(iterable))
    assert result == list(iterable)

def test_ltrack_with_bytes():
    iterable = b"abcdef"
    result = list(ltrack(iterable))
    assert result == list(iterable)

def test_ltrack_with_bytearray():
    iterable = bytearray(b"abcdef")
    result = list(ltrack(iterable))
    assert result == list(iterable)

def test_ltrack_with_frozenset():
    iterable = frozenset([1, 2, 3, 4, 5])
    taskid = "test_ltrack_with_frozenset"
    result = list(ltrack(iterable, taskid=taskid))
    assert set(result) == set(iterable)


#concurrency threads and parallelism 
def test_ltrack_with_threading():
    iterable = [1, 2, 3, 4, 5]
    result = []
    taskid = "test_ltrack_with_threading"

    def track():
        nonlocal result
        result = list(ltrack(iterable, taskid=taskid))

    thread = threading.Thread(target=track)
    thread.start()
    thread.join()

    assert result == iterable

def test_ltrack_with_threadpool_executor():
    iterable = [1, 2, 3, 4, 5]
    result = []
    taskid = "test_ltrack_with_threadpool_executor"

    def track():
        nonlocal result
        result = list(ltrack(iterable, taskid=taskid))

    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(track)
        future.result()

    assert result == iterable

def test_ltrack_with_multiple_threads():
    iterable = [1, 2, 3, 4, 5]
    results = []

    def track():
        results.append(list(ltrack(iterable)))

    threads = [threading.Thread(target=track) for _ in range(5)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    for result in results:
        assert result == iterable

def test_ltrack_with_multiple_threadpool_executors():
    iterable = [1, 2, 3, 4, 5]
    results = []

    def track():
        return list(ltrack(iterable, taskid="test_ltrack_with_multiple_threadpool_executors"))

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(track) for _ in range(5)]
        for future in as_completed(futures):
            results.append(future.result())

    for result in results:
        assert result == iterable

def test_ltrack_with_threading_and_custom_task_id():
    iterable = [1, 2, 3]
    task_id = "test_ltrack_with_threading_and_custom_task_id"
    result = []

    def track():
        nonlocal result
        result = list(ltrack(iterable, taskid=task_id))

    thread = threading.Thread(target=track)
    thread.start()
    thread.join()

    assert result == iterable

def test_ltrack_with_threadpool_executor_and_custom_total():
    iterable = [1, 2, 3]
    total = 10
    result = []

    def track():
        nonlocal result
        result = list(ltrack(iterable, total=total, taskid="test_ltrack_with_threadpool_executor_and_custom_total"))

    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(track)
        future.result()

    assert result == iterable
