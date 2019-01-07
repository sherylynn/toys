#!/bin/bash
python_version=3.6.8
python_prefix=${python_version//./}
python_final=${python_prefix:0:2}
echo $python_final
python_go=${python_version//./:0:2}
echo $python_go
#python_ok=${${python_version//./}:0:2}
echo $python_ok

if [ $python_version == '*3*' ];then
  echo "include"
fi

#[]操作符只有==和!=且不支持通配符
#[[]]支持
query=3
if [[ $python_version =~ ${query} ]];then
  echo "include"
fi
query1=6
if [[ $python_version == *${query1}* ]];then
  echo "include too"
fi
query2=4
if [[ $python_version != *${query2}* ]];then
  echo "exclude"
fi
query2=4
if [[ $python_version != *4* ]];then
  echo "exclude4"
fi
if [[ "$(pip --version)" != *from* ]]; then
  echo $(pip --version)
fi
if [[ $(pip --version) == *from* ]]; then
  echo 2
fi