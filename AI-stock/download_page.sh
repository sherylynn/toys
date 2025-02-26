#!/bin/bash

# 激活虚拟环境
source venv/bin/activate

# 运行Python脚本
python download_page.py "$@"

# 退出虚拟环境
deactivate