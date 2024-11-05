from ProgressPal import ftrack
import time
import numpy as np  

@ftrack()
def testfunction():
    print("Hello World")
    time.sleep(2)
    return True

@ftrack()
def tetfunction2():
    print("Hello World")
    time.sleep(2)
    return True

@ftrack()
def testfunction3():
    print("Hello World")
    time.sleep(2)
    return True

@ftrack()
def testfunction4():
    print("Hello World")
    time.sleep(2)
    return True

# function that throws an error once on its 3rd call
call_count = 0
@ftrack()
def testfunction5():
    global call_count
    
    if call_count % 2 == 0:
        call_count += 1
        raise ValueError("Error")
    call_count += 1

@ftrack()
def testfunction6():
    try:
        testfunction5()
    except Exception as e:
        print(e)
        pass
    time.sleep(2)
        


for i in range(300):
    testfunction()  
    # tetfunction2()
    # testfunction3()

    testfunction6()
    
    