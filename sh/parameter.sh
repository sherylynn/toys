#!/bin/bash
echo $0
echo $1
echo $2

if [[ $1 != "" ]]; then
  echo "\$1 is not empty"
else
  echo "\$1 is empty"
fi

args2=$2

if [[ $args2 != "" ]]; then
  echo "args2 is not empty"
else
  echo "args2 is empty"
fi
