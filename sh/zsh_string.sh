#!/bin/zsh

string=ftpserver-linux-arm64

if [[ $string != *.* ]];then
  echo "!!!!!!!"
else
  echo "ooooooo"
fi

if [[ $string == *.* ]];then
  echo "!!!!!!!"
else
  echo "ooooooo"
fi
