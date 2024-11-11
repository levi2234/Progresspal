from ProgressPal import ftrack
import time

ip ="127.0.0.1"


@ftrack(host=ip)
def testfunction():
    print("Hello World")
    time.sleep(2)
    return True

@ftrack(host=ip)
def tetfunction2():
    print("Hello World")
    time.sleep(2)
    return True

@ftrack(host=ip)
def testfunction3():
    print("Hello World")
    time.sleep(2)
    return True

@ftrack(host=ip)
def testfunction4():
    print("Hello World")
    time.sleep(2)
    return True

# function that throws an error once on its 3rd call
call_count = 0
@ftrack(host=ip)
def testfunction5():
    global call_count
    
    if call_count % 2 == 0:
        call_count += 1
        raise ValueError("Error")
    call_count += 1

@ftrack(host=ip)
def testfunction6():
    try:
        testfunction5()
    except Exception as e:
        print(e)
        pass
    time.sleep(2)
    
@ftrack(host=ip)
def testfunctionwithargs(a, b):
    # print(a + b)
    time.sleep(2)
    return a , b
        


for i in range(300):
    # testfunction()  
    # tetfunction2()
    # testfunction3()
    a,b = testfunctionwithargs(1, 2)
    print(a,b)
    # testfunction6()
    
    