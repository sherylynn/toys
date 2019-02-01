#!python3
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
print(type(Path.home()))
#print(path.join(Path.home(),"tools"))
print(path.join(str(Path.home()),"tools"))
