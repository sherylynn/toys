#!/bin/bash

# 设置错误时退出
set -e

echo "=== 开始初始化项目 ==="

# 检查是否安装了必要的工具
command -v go >/dev/null 2>&1 || { echo "错误: 需要安装 go"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "错误: 需要安装 npm"; exit 1; }

# 安装Go依赖
echo "\n[1/4] 正在安装 Go 依赖..."
go mod tidy || { echo "错误: Go 依赖安装失败"; exit 1; }
echo "✓ Go 依赖安装完成"

# 安装前端依赖
echo "\n[2/4] 正在安装前端依赖..."
npm install || { echo "错误: 前端依赖安装失败"; exit 1; }
echo "✓ 前端依赖安装完成"

# 构建前端
echo "\n[3/4] 正在构建前端..."
npm run build || { echo "错误: 前端构建失败"; exit 1; }
echo "✓ 前端构建完成"

# 检查配置文件
echo "\n[4/4] 正在检查项目配置..."
if [ ! -f "main.go" ]; then
    echo "错误: 未找到 main.go"
    exit 1
fi
if [ ! -f "package.json" ]; then
    echo "错误: 未找到 package.json"
    exit 1
fi
echo "✓ 项目配置检查完成"

# 启动服务
echo "\n正在启动服务..."
echo "提示: 使用 Ctrl+C 可以停止服务"
echo "----------------------------------------"

# 检查并终止可能存在的旧进程
echo "正在检查并清理旧进程..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# 启动Go后端服务
echo "正在启动Go后端服务..."
go run main.go &
BACKEND_PID=$!

echo "所有服务已启动，按Ctrl+C停止服务"

# 等待用户中断
trap 'kill $BACKEND_PID 2>/dev/null' INT
wait $BACKEND_PID

echo "\n=== 服务已停止 ==="