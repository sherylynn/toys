#!/bin/bash

# A股价值投资分析系统快速启动脚本

echo "=== A股价值投资分析系统 ==="
echo "1. 编译程序..."
go build -o ai-stock-value main.go value_investment.go cache_manager.go chart_generator.go

if [ $? -eq 0 ]; then
    echo "✅ 编译成功"
else
    echo "❌ 编译失败"
    exit 1
fi

echo "2. 创建必要目录..."
mkdir -p cache value_investment charts reports downloads

echo "3. 启动系统..."
echo "系统将在 http://localhost:8080 启动"
echo "按 Ctrl+C 停止服务"
echo ""

./ai-stock-value