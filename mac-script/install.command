#!/bin/zsh

echo "开始安装依赖..."

# 检查是否已安装 Homebrew
if ! command -v brew &> /dev/null; then
    echo "正在安装 Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "Homebrew 已安装"
fi

# 安装 scrcpy
if ! command -v scrcpy &> /dev/null; then
    echo "正在安装 scrcpy..."
    brew install scrcpy
else
    echo "scrcpy 已安装"
fi

# 安装 nmap
if ! command -v nmap &> /dev/null; then
    echo "正在安装 nmap..."
    brew install nmap
else
    echo "nmap 已安装"
fi

# 检查安装结果
if command -v scrcpy &> /dev/null && command -v nmap &> /dev/null; then
    echo "所有依赖安装完成！"
else
    echo "安装失败，请检查错误信息"
fi

sleep 3