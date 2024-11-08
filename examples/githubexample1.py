from ProgressPal import ftrack
import time
import numpy as np


from ProgressPal import ftrack

@ftrack()             # Decorator to track the progress of the function
def test_function():
    time.sleep(1)

for i in range(10):
    test_function()        # Call the function