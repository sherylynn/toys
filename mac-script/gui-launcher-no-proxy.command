#!/bin/zsh

# ADB设备管理器GUI版本启动脚本（无代理版本）
echo "=== ADB设备管理器 GUI 版本（无代理） ==="
echo "基于 scan.command 功能的图形化界面"
echo ""

# 记录开始时间
start_time=$(date +%s)
echo "启动时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 临时关闭代理设置
echo "🔧 正在关闭代理设置..."
unset http_proxy
unset HTTP_PROXY
unset https_proxy
unset HTTPS_PROXY
echo "✅ 代理设置已关闭"

# 检查Python3是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到Python3，请先安装Python3"
    echo "   可以使用以下命令安装：brew install python3"
    exit 1
fi

echo "✅ Python3 已安装: $(python3 --version)"

# 检查ADB是否安装
if ! command -v adb &> /dev/null; then
    echo "⚠️  警告：未找到ADB命令，请确保已安装Android SDK Platform Tools"
    echo "   可以使用以下命令安装：brew install android-platform-tools"
    echo ""
else
    echo "✅ ADB 已安装"
    # 检查ADB是否运行
    if ! pgrep -x "adb" > /dev/null; then
        echo "   正在启动ADB服务..."
        adb start-server
        sleep 2
    fi
fi

# 检查scrcpy是否安装
if ! command -v scrcpy &> /dev/null; then
    echo "⚠️  警告：未找到scrcpy，屏幕镜像功能可能无法使用"
    echo "   可以使用以下命令安装：brew install scrcpy"
else
    echo "✅ scrcpy 已安装"
fi

# 检查依赖脚本/别名
scripts=("sc" "sca" "scb")
for script in "${scripts[@]}"; do
    if type "$script" >/dev/null 2>&1; then
        echo "✅ $script 命令已找到"
    else
        echo "⚠️  $script 命令未找到"
    fi
done

echo ""
echo "🚀 正在启动服务器（无代理模式）..."
echo "   服务器地址: http://localhost:8080"
echo "   按 Ctrl+C 停止服务器"
echo ""

# 切换到脚本目录
cd "$(dirname "$0")"

# 加载 toolsinit.sh 中的别名和函数
if [ -f "$HOME/sh/win-git/toolsinit.sh" ]; then
    echo "✅ 加载 toolsinit.sh 中的别名和函数"
    source "$HOME/sh/win-git/toolsinit.sh"
fi

# 在无代理环境下启动服务器
env -u http_proxy -u HTTP_PROXY -u https_proxy -u HTTPS_PROXY python3 server.py
