#!/bin/bash

# Menu Bar App启动脚本
# macOS状态栏应用启动器

echo "=== ADB设备管理器 - 状态栏版本 ==="
echo "基于现有功能的macOS状态栏应用"
echo ""

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

# 检查rumps库是否安装
if ! python3 -c "import rumps" &> /dev/null; then
    echo "📦 正在安装rumps库..."
    python3 -m pip install --user rumps
    if [ $? -eq 0 ]; then
        echo "✅ rumps库安装成功"
    else
        echo "⚠️  rumps库安装失败，尝试使用--break-system-packages..."
        python3 -m pip install --user --break-system-packages rumps
        if [ $? -eq 0 ]; then
            echo "✅ rumps库安装成功"
        else
            echo "❌ rumps库安装失败，请手动安装：pip install --user --break-system-packages rumps"
            exit 1
        fi
    fi
else
    echo "✅ rumps库已安装"
fi

# 检查依赖脚本
scripts=("scan.command" "gui-launcher.command")
for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        echo "✅ $script 已找到"
    else
        echo "⚠️  $script 未找到"
    fi
done

echo ""
echo "🚀 正在启动状态栏应用..."
echo "   应用图标将出现在右上角的状态栏中"
echo "   右键点击图标查看所有选项"
echo ""

# 切换到脚本目录
cd "$(dirname "$0")"

# 启动状态栏应用（使用原生PyObjC版本）
python3 menu_bar_app_native.py