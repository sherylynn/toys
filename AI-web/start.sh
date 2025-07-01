#!/bin/bash

# 杀死所有正在运行的 Node.js server.js 进程
pkill -f "node server.js" || true

# 在后台启动 Node.js 服务器
node server.js &

echo "Node.js 服务器已启动。"
echo "请在浏览器中访问 http://bwh3.sherylynn.win:9999"
