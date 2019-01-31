from os import path
from pathlib import Path
import sys
import platform
#print(os.getcwd())
print(path.dirname(__file__))
print(__name__)
#os.chdir(os.path.dirname(__file__))
print(__file__)
print(Path.home())