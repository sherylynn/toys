#!/bin/bash
x=test
test(){
  #shell 函数只能返回整数
  #return $1
  $1 = 2
  echo $1
}
test x
echo $x
#上述表示无法直接对传的变量做定义
test2(){
  local x=$1
  echo ${x//s/g}
}
echo $(test2 $x)