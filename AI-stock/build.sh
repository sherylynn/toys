#!/bin/bash

# 创建输出目录
mkdir -p output

# 安装前端依赖并构建
echo "正在安装前端依赖..."
npm install

echo "正在构建前端项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "前端构建失败"
    exit 1
fi

echo "前端构建完成"

# 编译Go程序
echo "开始编译Go程序..."

# macOS ARM64
echo "编译 macOS ARM64 版本..."
GOOS=darwin GOARCH=arm64 go build -o output/ai-stock-darwin-arm64 main.go

# Linux ARM64
echo "编译 Linux ARM64 版本..."
GOOS=linux GOARCH=arm64 go build -o output/ai-stock-linux-arm64 main.go

# Windows x86
echo "编译 Windows x86 版本..."
GOOS=windows GOARCH=386 go build -o output/ai-stock-windows-x86.exe main.go

# Windows x64
echo "编译 Windows x64 版本..."
GOOS=windows GOARCH=amd64 go build -o output/ai-stock-windows-x64.exe main.go

# Android ARM64
echo "编译 Android ARM64 版本..."
GOOS=android GOARCH=arm64 go build -o output/ai-stock-android-arm64 main.go

echo "编译完成！"
echo "可执行文件已保存在 output 目录下："
ls -l output/