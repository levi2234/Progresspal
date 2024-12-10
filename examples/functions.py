from ProgressPal import ftrack, Plog
import time

ip ="127.0.0.1"

# SETUP EXAMPLE FUNCTIONS
@ftrack(host=ip, taskid="test2")
def testfunction():
    print("Hello World")
    time.sleep(2)
    return True

call_count = 0
@ftrack(host=ip)
def raiseexeption():

    global call_count
    if call_count % 2 == 0:
        call_count += 1

        raise ValueError("Error")
    call_count += 1

@ftrack(host=ip)
def handleexeption():

    try:
        raiseexeption()
    except Exception as e:
        print(e)

        pass
    time.sleep(2)
    
@ftrack(host=ip, taskid="test4")
def testfunctionwithargs(a, b):
    print(a + b)
    time.sleep(2)
    return a , b

def ParallelTest(id):
    function = ftrack(testfunction, host=ip, taskid=f"Joblib Iteration: {id}")
    for i in range(20):
        function()
        
if __name__ == "__main__":
    
    #EXAMPLES
    
    # # basic usage (use as a decorator) - WORKING
    # for i in range(20):
    #     testfunction()
        
    # # Basic usage (call the function) - WORKING
    # u = ftrack(testfunctionwithargs,host=ip, taskid="Test1")
    # g = ftrack(testfunctionwithargs,host=ip, taskid="Test2")
    # for i in range(20):
    #     a,b = u(1,2)
    #     m, n = g(1,2)


    #JobLib test - WORKING
    from joblib import Parallel, delayed
    Parallel(n_jobs=2)(delayed(ParallelTest)(i) for i in range(300))

    #Threading example - WORKING
    from threading import Thread
    threads = []
    for i in range(5):
        thread = Thread(target=testfunctionwithargs, args=(1, 2))
        threads.append(thread)
        thread.start()    
        
    for thread in threads:
        thread.join()
        
    #Concurrent futures example (WORKING)
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=5) as executor:
        for i in range(300):
            executor.submit(testfunction)
        
    # #Process example - NOT CRASHING BUT NOT WORKING
    from multiprocessing import Process
    processes = []
    for i in range(20):
        p = Process(target=testfunction)
        p.start()
        processes.append(p)
    for p in processes:
        p.join()
        
    #errror handling - WORKING
    for i in range(200):
        handleexeption()
        






    
    