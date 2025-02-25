#!/bin/bash

# 设置错误时退出
set -e

echo "=== 开始初始化项目 ==="

# 检查是否安装了必要的工具
command -v python3 >/dev/null 2>&1 || { echo "错误: 需要安装 python3"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "错误: 需要安装 npm"; exit 1; }

# 创建并激活虚拟环境
echo "\n[1/5] 正在设置 Python 虚拟环境..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ 虚拟环境创建成功"
else
    echo "✓ 虚拟环境已存在"
fi

# 激活虚拟环境
source venv/bin/activate || { echo "错误: 无法激活虚拟环境"; exit 1; }
echo "✓ 虚拟环境已激活"

# 安装 Python 依赖
echo "\n[2/5] 正在安装 Python 依赖..."
pip install -r requirements.txt || { echo "错误: Python 依赖安装失败"; exit 1; }
echo "✓ Python 依赖安装完成"

# 安装前端依赖
echo "\n[3/5] 正在安装前端依赖..."
npm install || { echo "错误: 前端依赖安装失败"; exit 1; }
echo "✓ 前端依赖安装完成"

# 检查配置文件
echo "\n[4/5] 正在检查项目配置..."
if [ ! -f "server.py" ]; then
    echo "错误: 未找到 server.py"
    exit 1
fi
if [ ! -f "package.json" ]; then
    echo "错误: 未找到 package.json"
    exit 1
fi
echo "✓ 项目配置检查完成"

# 启动服务
echo "\n[5/5] 正在启动服务..."
echo "提示: 使用 Ctrl+C 可以停止所有服务"
echo "----------------------------------------"

# 检查并终止可能存在的旧进程
echo "正在检查并清理旧进程..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# 启动文件监控服务和前端服务
echo "正在启动服务..."

# 启动前端服务
npm run dev &
FRONTEND_PID=$!

# 启动后端文件监控服务
${VIRTUAL_ENV}/bin/python3 watch_server.py &
BACKEND_PID=$!

echo "所有服务已启动，按Ctrl+C停止服务"

# 等待用户中断
trap 'kill $FRONTEND_PID $BACKEND_PID 2>/dev/null' INT
wait $FRONTEND_PID $BACKEND_PID

# 清理虚拟环境
deactivate
echo "\n=== 服务已停止，项目环境已清理 ==="