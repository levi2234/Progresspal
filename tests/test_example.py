
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