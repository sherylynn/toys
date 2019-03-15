if [[ "$(uname -a)" =~ "*x86_64*|*i686*" ]]; then
  echo 1
elif [[ "$(uname -a)" =~ "*i686*" ]]; then
  echo 2
elif [[ "$(uname -a)" == "*i686*" ]]; then
  echo 3
elif [[ "$(uname -a)" =~ *i686* ]]; then
  echo 4
elif [[ "$(uname -a)" =~ "*i686*" ]]; then
  echo 5
elif [[ "$(uname -a)" =~ (*i686*) ]]; then
  echo 6
elif [[ "$(uname -a)" =~ (64)|(i686) ]]; then
  echo 7
  #真实可用的正则 =~ 且不带引号
elif [[ "$(uname -a)" =~ (i686) ]]; then
  echo 8
elif [[ "$(uname -a)" == *i686* ]]; then
  echo 9
fi

