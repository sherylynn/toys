#!/bin/zsh

# 获取当前用户的桌面路径
DESKTOP_PATH="$HOME/Desktop"

# 获取scan.command的完整路径
SCRIPT_PATH="$(dirname $0)/scan.command"

# 检查scan.command是否存在
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "错误：找不到scan.command文件"
    exit 1
fi

# 创建软链接
ln -sf "$SCRIPT_PATH" "$DESKTOP_PATH/scan.command"

# 确保链接具有执行权限
chmod +x "$DESKTOP_PATH/scan.command"

echo "快捷方式已成功创建在桌面上"
sleep 2