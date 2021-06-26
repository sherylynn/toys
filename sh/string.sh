#!/bin/bash
python_version=3.6.8
python_prefix=${python_version//./}
#切片掉第一个数字3
python_no_first_word=${python_version#"3"}
echo $python_no_first_word
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

#搜索特殊符号 比如字符点 .
bin_with_period=golang.tar.gz
bin_without_period=ftpserver-linux-arm64
if [[ $bin_with_period == *.* ]];then
  echo "包含了字符点."
fi
if [[ $bin_without_period != *.* ]];then
  echo "不包含字符点"
fi

