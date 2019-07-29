#!/bin/bash
files=("/etc/pacman.d/mirrorlist.mingw32" "/etc/pacman.d/mirrorlist.mingw64" "/etc/pacman.d/mirrorlist.msys")
strs[1]='Server = http://mirrors.ustc.edu.cn/msys2/mingw/i686'
strs[2]='Server = http://mirrors.ustc.edu.cn/msys2/mingw/x86_64'
strs[3]='Server = http://mirrors.ustc.edu.cn/msys2/msys/$arch'
for file in ${files[@]}
do
  echo $file
done
for str in ${strs[@]}
do
  echo $str
done
