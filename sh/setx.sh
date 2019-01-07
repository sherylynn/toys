#!/bin/bash
#echo %PATH%
echo $PATH
#echo ${PATH//:/\n}
# echo -e 能根据 \n 换行  这里的把$PATH的分隔符: 换成;\n 
echo -e ${PATH//:/\\n} |sort|uniq|cygpath -w -f - 
echo --------------------------------------------------------
# 因为最后一个$PATH中的值是没有:分隔符的，这里补充一个;
winENV="$(echo -e ${PATH//:/;\\n}';' |sort|uniq|cygpath -w -f -)"
#cygpath 是 msys带的处理路径的工具
echo $winENV
setx test_env "$winENV"
powershell -C "[environment]::SetEnvironmentvariable('path', \"$winENV\", 'User')"
#git bash 中的powershell获得的path也是污染过的
powershell -C "[System.Environment]::SetEnvironmentVariable('test_env', \$Env:Path + \";c:\oracle;c:\oracle\bin\", 'user')"