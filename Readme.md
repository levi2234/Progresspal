![img](https://imgur.com/66SFDDo.png)

![Static Badge](https://img.shields.io/badge/Build_Status-Beta-purple)
![Static Badge](https://img.shields.io/badge/Python-3.8-green)
![Static Badge](https://badge.fury.io/py/ProgressPal.svg)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/9400e86d39bf4affb749f38aab25e9d7)](https://app.codacy.com/gh/levi2234/Progresspal/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
![Static Badge](https://img.shields.io/badge/Licence-MIT-blue)


<p align="Left"> This project provides an easy-to-use tool for tracking the progress of Python iterables, functions, and log messages to an independent log server. It allows users to monitor multiple Python scripts from any device with an internet connection. With this decentralized approach, users can collaborate and monitor the real-time progress of various scripts running on different devices and processes. This tool enables seamless tracking across distributed systems, making it ideal for collaborative projects and remote monitoring.
 </p>

# Table of Contents
- [Table of Contents](#table-of-contents)
- [Key Features](#key-features)
- [Operational Status](#operational-status)
- [Installation](#installation)
  - [Pip Install (Stable version)](#pip-install-stable-version)
  - [Clone (Development version)](#clone-development-version)
- [Usage](#usage)
  - [Log server](#log-server)
  - [Iterables and generators](#iterables-and-generators)
  - [Functions](#functions)
  - [Collaborate using ProgressPal](#collaborate-using-progresspal)
  - [License](#license)


 <!-- Key features -->
# Key Features

- **Progress Tracking**: Track the progress of Python iterables, functions, and log messages in real-time (0.5 - 2 ms overhead).
- **Decentralized Monitoring**: Monitor multiple Python scripts from any device with an internet connection.
- **Collaborative Projects**: Collaborate and monitor the real-time progress of various scripts running on different devices and processes.
- **Distributed Systems**: Track progress across distributed systems for seamless monitoring and remote collaboration.
- **Function Tracking**: Track the call-count, execution time distribution, execution history, time between calls, error count, function file origin, and function name.
- **Iterable Tracking**: Track the progress of iterables and generators with a progress bar. Additionally, track the total number of iterations, current iteration, and percentage completion, time remaining, iteration execution time, and iteration rate.
- **Log Server**: Start a log server to receive progress updates from Python scripts. The log server can be accessed from any device with an internet connection.
- **Threading support**: Track the progress of multiple threads and processes simultaneously.
- **Search Functionality**: Search for specific functions and iterables in the log server.

<!-- Include video from imgur -->
![gif](https://i.imgur.com/Wzb0fXt.gif)

# Operational Status

|   | Function Tracking  | Iterable Tracking  | Logging  |
|---|---| ---| ---|
| Default usage | ![Static Badge](https://img.shields.io/badge/Working-green)  | ![Static Badge](https://img.shields.io/badge/Working-green)   | ![Static Badge](https://img.shields.io/badge/Working-green)   |
| Joblib  | ![Static Badge](https://img.shields.io/badge/Working-green)   | ![Static Badge](https://img.shields.io/badge/Working-green)   |  ![Static Badge](https://img.shields.io/badge/Working-green)   |
| MultiProcessing Process |  ![Static Badge](https://img.shields.io/badge/Not_crashing-orange)  | ![Static Badge](https://img.shields.io/badge/Working-green)  | ![Static Badge](https://img.shields.io/badge/Working-green)   |
| Threading  |  ![Static Badge](https://img.shields.io/badge/Working-green)  | ![Static Badge](https://img.shields.io/badge/Working-green)   | ![Static Badge](https://img.shields.io/badge/Working-green)   |
| Concurrent ThreadPool |  ![Static Badge](https://img.shields.io/badge/Working-green)  | ![Static Badge](https://img.shields.io/badge/Working-green)   |   ![Static Badge](https://img.shields.io/badge/Working-green)   |
| Concurrent ProcessPool  | ![Static Badge](https://img.shields.io/badge/Working-green)   | ![Static Badge](https://img.shields.io/badge/Working-green)   | ![Static Badge](https://img.shields.io/badge/Working-green)   |

# Installation


## Pip Install (Stable version)
```bash
pip install ProgressPal
```

## Clone (Development version)
Navigate to your desired installation directory and clone the repository using the following command:

```bash
git clone https://github.com/levi2234/Progresspal
```

Navigate to the installation directory and use either a pip install or python setup.py install to install the package.

**Pip method**
```bash
pip install .
```

**Setup.py method**
```bash
python setup.py install
```

# Usage

## Log server
The progresspal package reports the progress of iterables, functions, and log messages to a log server. The log server can be started by running the following command in the terminal (by default can be found on http://127.0.0.1:5000).
```bash
ProgressPal start
```

If this command does not work it is possible to start the log server by running the following code in a Python script.
```python
from ProgressPal.webapp.webapp import start_web_server

start_web_server()
```



## Iterables and generators
Using ProgressPal is simple and might even feel familiar to those who have used tqdm and the logging module in Python. The following is a simple example of how to use ProgressPal to track the progress of a for loop.


**BASIC USAGE**
```python
from ProgressPal import ltrack
import time

for i in ltrack(np.arange(100)):
    time.sleep(0.1)  
```
Which will report the progress of the for loop to the ProgressPal server. This can be done with any iterable or generator. 

```python	
from ProgressPal import ltrack
import time

for i in ltrack(range(100), total=100): # providing a total is required for generators
    time.sleep(0.1)  
```

The result of the above code can be seen in the ProgressPal server as such: 

![gif](https://imgur.com/HKb4OvQ.gif)

**PARRALEL, THREADING, JOBLIB USAGE**
Using loops in Parallel, threading, or joblib can be done easily. However, it is important to efficently name the tasks in order to track them properly. If the *taskid* is not provided all parallel processes will report to the same task. This will result in improper tracking. Therefore when tracking loops ran in parallel it is important to provide a unique taskid for each loop. Below is an example of how to track loops in parallel and an example of how to track loops in parallel using threading and joblib.

```python
from ProgressPal import ltrack

#example function
def testfunction(id):
    for i in ltrack(range(100), taskid = f"Loop {id}"):
        time.sleep(1)

#THREADING
from threading import Thread
threads = []
for i in ltrack(range(10), total=10, taskid="Tracking progress of Threading Threads"):
    thread = Thread(target=testfunction, args=(i,))
    threads.append(thread)
    thread.start()

# CONCURRENT
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=5) as executor:
    for i in ltrack(range(10), total=10, taskid="Tracking progress of concurrent threads"): 
        executor.submit(testfunction, i)

# JOBLIB
from joblib import Parallel, delayed
Parallel(n_jobs=5)(delayed(testfunction)(i) for i in ltrack(range(10), total=10, taskid="Tracking progress of Joblib jobs"))


```
## Functions
ProgressPal can also be used to track the execution functions . The following is an example of how to use ProgressPal to track the progress of a function. There are two methods. One is to use the decorator and the other is to use the function itself. Both have their own use cases and can be used interchangeably. The decorator is useful when you want to track the overall progress of a function. If you want to track the progress of a function in a loop or in a parallel process, it is better to use the function itself. This way you can give each function a unique taskid and track the unique progress of that instance of the function.  Below is an example of how to use both methods.

**BASIC USAGE**
```python
from ProgressPal import ftrack


#DECORATOR usage - METHOD 1
@ftrack()            
def test_function_decorator():
    time.sleep(1)

for i in range(10):
    test_function_decorator()  

#FUNCTION usage - METHOD 2
def test_function_inline():
    time.sleep(1)

u = ftrack(test_function_inline, taskid = "Inline function tracking u")
v = ftrack(test_function_inline, taskid = "Inline function tracking v")

for i in range(10):
    u()
    v()  

```

The result of the above code (Method 1) can be seen in the ProgressPal server as such:
![gif](https://imgur.com/or1sGNA.gif)


**PARRALEL, THREADING, JOBLIB USAGE**

```python
from ProgressPal import ftrack

#THREADING
@ftrack(host=ip, taskid="test4")
def testfunctionwithargs(a, b):
    print(a + b)
    time.sleep(2)
    return a , b

from threading import Thread
threads = []
for i in range(5):
    thread = Thread(target=testfunctionwithargs, args=(1, 2))
    threads.append(thread)
    thread.start()    
    
for thread in threads:
    thread.join()

#CONCURRENT
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=5) as executor:
    for i in range(300):
        executor.submit(testfunctionwithargs, 1, 2)

"""
For more Parallel, Joblib and Threading examples please refer to the examples folder in the ProgressPal repository.
"""
```

## Collaborate using ProgressPal


ProgressPal is designed to be a collaborative tool that allows users to monitor the progress of various scripts running on different devices and processes. Through this approach it is possible to monitor the progress of multiple scripts in real-time, making it ideal for collaborative projects and remote monitoring. To do this the logserver needs to be publically hosted in order to be accessed by people outside of the local network. This can be done by port forwarding the logserver or by hosting the logserver on a cloud service.

A free and easy way to host the logserver is through the built in vscode port forwarding which can be accessed as such:
![gif](https://imgur.com/L0LT4fu.gif)

After the logserver is publically hosted other users can access the logserver by redirecting their progresspal to the publically hosted logserver.  This can be done by including the following arguments in ftrack ltrack and Plog functions:

```python
from ProgressPal import ftrack, ltrack, Plog

# FTRACK
@ftrack(host = 'yourhost', port = 'yourport')             # Decorator to track the progress of the function
def test_function():
    time.sleep(1)

# LTRACK
for i in ltrack([1,2,3,4], host ='yourhost', port ='yourport'): 
    time.sleep(0.1)

# PLOG
logger = Plog(host = 'yourhost', port = 'yourport')
logger.info('This is a test message')

```


## License

MIT