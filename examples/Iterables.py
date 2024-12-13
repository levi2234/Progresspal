import time
import numpy as np
from threading import Thread
from multiprocessing import Process
from ProgressPal import ltrack
import random
import itertools
from collections import deque
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
from joblib import Parallel, delayed


ip = "127.0.0.1"
port = 5000


def nested_loops_1():
    for j in ltrack(range(5), taskid="Thread1_Main", total=5, host=ip, port=port):
        time.sleep(random.uniform(0.1, 0.5))
        for i in ltrack(
            itertools.cycle([1, 2, 3, 4, 5]),
            taskid="Thread1_Secondary",
            total=5,
            host=ip,
            port=port,
        ):
            time.sleep(random.uniform(0.1, 0.5))
            for k in ltrack(
                np.arange(0, 5, 0.5),
                taskid="Thread1_Tertiary",
                total=len(np.arange(0, 5, 0.5)),
                host=ip,
                port=port,
            ):
                time.sleep(random.uniform(3, 5))


def nested_loops_2():
    for j in ltrack(range(5), taskid="Thread2_Main", total=5, host=ip):
        time.sleep(random.uniform(0.1, 0.5))
        for i in ltrack(
            deque([1, 2, 3, 4, 5]),
            taskid="Thread2_Secondary",
            host=ip,
            total=len(deque([1, 2, 3, 4, 5])),
        ):
            time.sleep(random.uniform(0.1, 0.5))
            for k in ltrack(
                np.arange(0, 5, 0.5),
                taskid="Thread2_Tertiary",
                host=ip,
                total=len(np.arange(0, 5, 0.5)),
            ):
                time.sleep(random.uniform(0.1, 0.5))


def nested_loops_3():
    df = pd.DataFrame({"A": range(5)})
    for j in ltrack(
        df["A"], taskid="Process1_Main", total=len(df["A"]), host=ip, port=port
    ):
        time.sleep(random.uniform(0.1, 0.5))
        for i in ltrack(
            itertools.repeat(1, 5), taskid="Process1_Secondary", total=5, host=ip
        ):
            time.sleep(random.uniform(0.1, 0.5))
            for k in ltrack(
                np.arange(0, 5, 0.5),
                taskid="Process1_Tertiary",
                total=len(np.arange(0, 5, 0.5)),
                host=ip,
                port=port,
            ):
                time.sleep(random.uniform(0.1, 0.5))


def nested_loops_4():
    for j in ltrack(range(5), taskid="Process2_Main", total=5, host=ip):
        time.sleep(random.uniform(0.1, 0.5))
        for i in ltrack(
            itertools.chain([1, 2], [3, 4, 5]),
            taskid="Process2_Secondary",
            total=5,
            host=ip,
            port=port,
        ):
            time.sleep(random.uniform(0.1, 0.5))
            for k in ltrack(
                np.arange(0, 5, 0.5),
                taskid="Process2_Tertiary",
                total=len(np.arange(0, 5, 0.5)),
                host=ip,
                port=port,
            ):
                time.sleep(random.uniform(0.1, 0.5))


if __name__ == "__main__":
    for i in ltrack(range(100), total=100, taskid="Basic Usage Generator"):
        time.sleep(0.1)

    # BASIC USAGE ITERABLES
    for i in ltrack([1, 3, 4, 5, 6, 7, 8, 9, 10], taskid="Basic Usage Iterable"):
        print(i)

    # BASIC USAGE GENERATOR
    for i in ltrack(range(100), total=100, taskid="Basic Usage Generator"):
        print(i)

    # THREADING EXAMPLE
    thread1 = Thread(target=nested_loops_1)
    thread2 = Thread(target=nested_loops_2)
    thread1.start()
    thread2.start()
    thread1.join()
    thread2.join()

    # PROCESS EXAMPLE
    process1 = Process(target=nested_loops_3)
    process2 = Process(target=nested_loops_4)
    process1.start()
    process2.start()
    process1.join()
    process2.join()

    # ThreadPoolExecutor EXAMPLE
    with ThreadPoolExecutor(max_workers=2) as executor:
        executor.submit(nested_loops_1)
        executor.submit(nested_loops_2)
        executor.submit(nested_loops_3)
        executor.submit(nested_loops_4)

    # JOBLIB EXAMPLE
    Parallel(n_jobs=2)(
        [
            delayed(nested_loops_1)(),
            delayed(nested_loops_2)(),
            delayed(nested_loops_3)(),
            delayed(nested_loops_4)(),
        ]
    )

    # JOBLIB EXAMPLE 2
    def wait_three_seconds(x):
        time.sleep(3)
        return x

    result = Parallel(n_jobs=5)(
        (
            delayed(wait_three_seconds)(i)
            for i in ltrack(range(100), total=100, taskid="Joblib Test")
        )
    )
