

#unittest is a built-in module in Python, you don't need to install it

#UNITTEST example
import unittest

class Tests(unittest.TestCase):
    def test_addition(self):
        self.assertEqual(1 + 1, 2)
    
    def test_subtraction(self):
        self.assertEqual(1 - 1, 0)
    
    def test_multiplication(self):
        self.assertEqual(2 * 2, 4)
    
    def test_division(self):
        self.assertEqual(4 / 2, 2)
        
        
        
#pytest is a third-party module, you need to install it first

#PYTEST example
#import pytest
from src.PackageName.math_operations import multiply, divide, power, root, factorial 

def test_multiply():
    assert multiply(2, 3) == 6

def test_divide():
    assert divide(4, 2) == 2

def test_power():
    assert power(2, 3) == 8
    
def test_root():
    assert root(4, 2) == 2
    
def test_factorial():
    assert factorial(5) == 120
'''
To run the tests, you can use the following commands from the root directory of the project:

------------------------------------------------------------------------------------------------------------------------------------------------
UNITTEST :
!! needs to be run from the root directory of the project while keeping the "src" in the path (see line 27 - "src.ModuleName.math_operations")!!

python -m unittest  or python -m unittest discover tests
------------------------------------------------------------------------------------------------------------------------------------------------

PYTEST :
!! needs to be run from the root directory of the project while omitting the "src" in the path (change line 27 to - "ModuleName.math_operations")!!

PYTHONPATH=src 
pytest tests/ -v
-------------------------------------------------------------------------------------------------------------------------------------------------

'''