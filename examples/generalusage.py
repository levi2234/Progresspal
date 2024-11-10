from ProgressPal import ftrack , ltrack , Plog
import time
import threading
import numpy as np  
import asyncio
# This demo shows a wide impolementation of frack, ltrack and Plog
# in various environments such as threading, normal use and a variation 
# of iterable types

def show_ltrack_usage():
    # ltrack usage with multiple iterable types

    lists = [1, 2, 3]
    tuples = (4, 5, 6)
    dicts = {7: 'a', 8: 'b', 9: 'c'}
    genrator = (x for x in range(10, 13))

    def print_list():
        for i in ltrack(lists):
            print(i)
            time.sleep(1)

    def print_tuple():
        for i in ltrack(tuples):
            print(i)

    def print_dict():
        for i in ltrack(dicts):
            print(i)

    def print_generator():
        for i in ltrack(genrator, total= 3):
            print(i)

    # Create threads
    thread1 = threading.Thread(target=print_list)
    thread2 = threading.Thread(target=print_tuple)
    thread3 = threading.Thread(target=print_dict)
    thread4 = threading.Thread(target=print_generator)

    # Start threads
    thread1.start()
    thread2.start()
    thread3.start()
    thread4.start()

    # Wait for all threads to complete
    thread1.join()
    thread2.join()
    thread3.join()
    thread4.join()
    
def show_ftrack_usage():
    
    @ftrack
    def ftracktestfunct():
        time.wait(np.random.randint(1, 5))
        
        
    @ftrack
    async def ftracktestfunct2():
        time.wait(np.random.randint(1, 5))
        #throw a random error every 5th time
        if np.random.randint(1, 5) == 5:
            raise ValueError('Random Error')
        
    def ftracktestfunctcombined():
        for i in range(100):
            ftracktestfunct()
            ftracktestfunct2()
        
    
    ftracktestfunctcombined()
    

# show_ftrack_usage()
show_ltrack_usage()