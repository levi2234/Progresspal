import time
import numpy as np
from threading import Thread
from multiprocessing import Process
from ProgressPal import ltrack
import random
import itertools
from collections import deque
import pandas as pd

ip = "127.0.0.1"

def nested_loops_1():
    for j in ltrack(range(1000), taskid="Thread1_Main", total=1000, host=ip):
        time.sleep(random.uniform(1, 3))
        for i in ltrack(itertools.cycle([1, 2, 3, 4, 5]), taskid="Thread1_Secondary", total=1000, host=ip):
            time.sleep(random.uniform(1, 3))
            for k in ltrack(np.arange(0, 1000, 0.5), taskid="Thread1_Tertiary", total=len(np.arange(0, 1000, 0.5)), host=ip):
                time.sleep(random.uniform(1, 3))

def nested_loops_2():
    for j in ltrack(range(1000), taskid="Thread2_Main", total=1000, host=ip):
        time.sleep(random.uniform(1, 3))
        for i in ltrack(deque([1, 2, 3, 4, 5]), taskid="Thread2_Secondary", host=ip, total=1000):
            time.sleep(random.uniform(1, 3))
            for k in ltrack(np.arange(0, 1000, 0.5), taskid="Thread2_Tertiary", host=ip, total=len(np.arange(0, 1000, 0.5))):
                time.sleep(random.uniform(1, 3))

def nested_loops_3():
    df = pd.DataFrame({'A': range(1000)})
    for j in ltrack(df['A'], taskid="Process1_Main", total=len(df['A']), host=ip):
        time.sleep(random.uniform(1, 3))
        for i in ltrack(itertools.repeat(1, 1000), taskid="Process1_Secondary", total=1000, host=ip):
            time.sleep(random.uniform(1, 3))
            for k in ltrack(np.arange(0, 1000, 0.5), taskid="Process1_Tertiary", total=len(np.arange(0, 1000, 0.5)), host=ip):
                time.sleep(random.uniform(1, 3))

def nested_loops_4():
    for j in ltrack(range(1000), taskid="Process2_Main", total=1000, host=ip):
        time.sleep(random.uniform(1, 3))
        for i in ltrack(itertools.chain([1, 2], [3, 4, 5]), taskid="Process2_Secondary", total=1000, host=ip):
            time.sleep(random.uniform(1, 3))
            for k in ltrack(np.arange(0, 1000, 0.5), taskid="Process2_Tertiary", total=len(np.arange(0, 1000, 0.5)), host=ip):
                time.sleep(random.uniform(1, 3))

if __name__ == "__main__":
    # Create threads
    thread1 = Thread(target=nested_loops_1)
    thread2 = Thread(target=nested_loops_2)

    # Create processes
    process1 = Process(target=nested_loops_3)
    process2 = Process(target=nested_loops_4)

    # Start threads
    thread1.start()
    thread2.start()

    # Start processes
    process1.start()
    process2.start()

    # Wait for threads to complete
    thread1.join()
    thread2.join()

    # Wait for processes to complete
    process1.join()
    process2.join()