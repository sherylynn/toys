#!/bin/bash
realpath(){
  local x=$1
  echo $(cd "$(dirname "$0")";pwd)/$x
}

echo $(realpath ./realpath.sh)
