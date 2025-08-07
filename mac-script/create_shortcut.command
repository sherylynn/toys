#!/bin/zsh

# 获取当前用户的桌面路径
DESKTOP_PATH="$HOME/Desktop"

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 创建scan.command的快捷方式
SCAN_PATH="$SCRIPT_DIR/scan.command"
if [ ! -f "$SCAN_PATH" ]; then
    echo "错误：找不到scan.command文件"
    exit 1
fi

# 创建gui-launcher.command的快捷方式
GUI_LAUNCHER_PATH="$SCRIPT_DIR/gui-launcher.command"
if [ ! -f "$GUI_LAUNCHER_PATH" ]; then
    echo "错误：找不到gui-launcher.command文件"
    exit 1
fi

# 创建menu-bar-launcher.command的快捷方式
MENU_BAR_PATH="$SCRIPT_DIR/menu-bar-launcher.command"
if [ ! -f "$MENU_BAR_PATH" ]; then
    echo "错误：找不到menu-bar-launcher.command文件"
    exit 1
fi

# 先删除可能存在的旧链接
rm -f "$DESKTOP_PATH/scan.command"
rm -f "$DESKTOP_PATH/gui-launcher.command"
rm -f "$DESKTOP_PATH/menu-bar-launcher.command"

# 创建软链接（使用绝对路径）
ln -sf "$SCAN_PATH" "$DESKTOP_PATH/scan.command"
ln -sf "$GUI_LAUNCHER_PATH" "$DESKTOP_PATH/gui-launcher.command"
ln -sf "$MENU_BAR_PATH" "$DESKTOP_PATH/menu-bar-launcher.command"

# 确保链接具有执行权限
chmod +x "$DESKTOP_PATH/scan.command"
chmod +x "$DESKTOP_PATH/gui-launcher.command"
chmod +x "$DESKTOP_PATH/menu-bar-launcher.command"

echo "快捷方式已成功创建在桌面上："
echo "  - scan.command (命令行版本)"
echo "  - gui-launcher.command (图形界面版本)"
echo "  - menu-bar-launcher.command (状态栏版本)"
echo ""
echo "原始文件路径："
echo "  - $SCAN_PATH"
echo "  - $GUI_LAUNCHER_PATH"
echo "  - $MENU_BAR_PATH"
sleep 2