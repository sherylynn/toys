#!/bin/bash
python_version=3.6.8
python_prefix=${python_version//./}
python_final=${python_prefix:0:2}
echo $python_final
python_go=${python_version//./:0:2}
echo $python_go
python_ok=${${python_version//./}:0:2}
echo $python_ok