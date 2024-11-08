
<p align="center">
  <a href="src/ProgressPal/webapp/static/media/ProgressPalMD.png">
    <img src="src/ProgressPal/webapp/static/media/ProgressPalMD.png" alt="Markdownify" width="500" style="vertical-align: middle;">
  </a>
</p>



<p align="Left"> This project provides an easy-to-use tool for tracking the progress of Python iterables, functions, and log messages to an independent log server. It allows users to monitor multiple Python scripts from any device with an internet connection. With this decentralized approach, users can collaborate and monitor the real-time progress of various scripts running on different devices and processes. This tool enables seamless tracking across distributed systems, making it ideal for collaborative projects and remote monitoring.
 </p>

 <!-- Key features -->
## Key Features

- **Progress Tracking**: Track the progress of Python iterables, functions, and log messages in real-time.
- **Decentralized Monitoring**: Monitor multiple Python scripts from any device with an internet connection.
- **Collaborative Projects**: Collaborate and monitor the real-time progress of various scripts running on different devices and processes.
- **Distributed Systems**: Track progress across distributed systems for seamless monitoring and remote collaboration.
- **Function Tracking**: Track the call-count, execution time distribution, time between calls, error count, function file origin, and function name.
- **Iterable Tracking**: Track the progress of iterables and generators with a progress bar. Additionally, track the total number of iterations, current iteration, and percentage completion, time remaining, iteration execution time, and iteration rate.
- **Log Server**: Start a log server to receive progress updates from Python scripts. The log server can be accessed from any device with an internet connection.
- **Threading**: Track the progress of multiple threads and processes simultaneously.
- **Search Functionality**: Search for specific functions and iterables in the log server.

<p align="center">
  <!-- <a href="https://badge.fury.io/js/electron-markdownify">
    <img src="https://badge.fury.io/js/electron-markdownify.svg" alt="Gitter">
  </a>
  <a href="https://gitter.im/amitmerchant1990/electron-markdownify">
    <img src="https://badges.gitter.im/amitmerchant1990/electron-markdownify.svg">
  </a> -->
  <!-- <a href="https://saythanks.io/to/bullredeyes@gmail.com">
      <img src="https://img.shields.io/badge/SayThanks.io-%E2%98%BC-1EAEDB.svg">
  </a>
  <a href="https://www.paypal.me/AmitMerchant">
    <img src="https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&amp;style=flat">
  </a> -->
</p>


## Installation

### Clone
Navigate to your desired installation directory and clone the repository using the following command:

```bash
git clone https://github.com/levi2234/Progresspal
```

Navigate to the installation directory and use either a pip install or python setup.py install to install the package.

#### Pip Install
```bash
pip install .
```

#### Python Setup
```bash
python setup.py install
```

### Pip Install (Coming Soon)
```bash
pip install ProgressPal
```


## Usage

### Log server
The progresspal package reports the progress of iterables, functions, and log messages to a log server. The log server can be started by running the following command in the terminal (by default can be found on http://127.0.0.1:5000).
```bash
ProgressPal start
```


### Iterables and generators
Using ProgressPal is simple and might even feel familiar to those who have used tqdm and the logging module in Python. The following is a simple example of how to use ProgressPal to track the progress of a for loop.

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

<p align="center">
  <img src="mdmedia/Ltrackvideo.gif" alt="ProgressPal Demonstration GIF" width="100%" style="vertical-align: middle;">
</p>


### Functions
ProgressPal can also be used to track the execution functions . The following is an example of how to use ProgressPal to track the progress of a function

```python
from ProgressPal import ftrack

@ftrack()             # Decorator to track the progress of the function     
def test_function():
    time.sleep(1)

for i in range(10):
    test_function()  
```

The result of the above code can be seen in the ProgressPal server as such:
<p align="center">
  <img src="mdmedia/ProgresspalFtrack.gif" alt="ProgressPal Demonstration GIF" width="100%" style="vertical-align: middle;">
</p>


## Collaborating with ProgressPal
ProgressPal is designed to be a collaborative tool that allows users to monitor the progress of various scripts running on different devices and processes. Through this approach it is possible to monitor the progress of multiple scripts in real-time, making it ideal for collaborative projects and remote monitoring. To do this the logserver needs to be publically hosted in order to be accessed by people outside of the local network. This can be done by port forwarding the logserver or by hosting the logserver on a cloud service.

After the logserver is publically hosted other users can access the logserver by redirecting their progresspal to the publically hosted logserver.  This can be done by including the following arguments in ftrack ltrack and Plog functions:

```python
from ProgressPal import ftrack, ltrack, plog

# FTRACK
@ftrack(host = 'yourhost', port = 'yourport')             # Decorator to track the progress of the function
def test_function():
    time.sleep(1)

# LTRACK
for i in ltrack([1,2,3,4], host ='yourhost', port ='yourport'): 
    time.sleep(0.1)

# PLOG
logger = plog(host = 'yourhost', port = 'yourport')
logger.info('This is a test message')

```


## License

MIT