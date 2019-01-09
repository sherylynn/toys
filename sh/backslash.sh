#!/bin/bash
DoubleBackSlash(){
  local y=$1
  local y_double=${y//\\/\\\\}
  echo $y_double
}
x=$(echo $(pwd)|cygpath -w -f -)
echo $x
echo $(DoubleBackSlash $x)
y='C:\Users\lynn\tools\python-pip\Python36\site-packages'
echo $(DoubleBackSlash $y)