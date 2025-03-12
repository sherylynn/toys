#!/bin/bash

# 定义颜色代码
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # 重置颜色

# 检查dialog是否安装
check_dialog() {
  if ! command -v dialog &> /dev/null; then
    echo -e "${RED}错误：需要安装dialog工具${NC}"
    echo "请使用以下命令安装："
    echo "brew install dialog"
    exit 1
  fi
}

# 获取虚拟网卡列表
get_vnics() {
  ifconfig | grep -E '^(utun|tun)[0-9]+:' | awk '{print $1}' | tr -d ':'
}

# 主界面
main_menu() {
  while true; do
    vnics=($(get_vnics))
    
    if [ ${#vnics[@]} -eq 0 ]; then
      dialog --title "虚拟网卡管理" --msgbox "\n当前没有可用的虚拟网卡" 10 40
      return
    fi

    menu_items=()
    for i in "${!vnics[@]}"; do
      menu_items+=("$((i+1))" "${vnics[$i]}")
    done

    choice=$(dialog --title "虚拟网卡管理" \
                    --menu "\n选择要操作的虚拟网卡：" \
                    20 50 10 \
                    "${menu_items[@]}" \
                    3>&1 1>&2 2>&3)

    if [ $? -ne 0 ]; then
      return
    fi

    selected_vnic="${vnics[$((choice-1))]}"
    action_menu "$selected_vnic"
  done
}

# 操作菜单
action_menu() {
  vnic=$1
  while true; do
    choice=$(dialog --title "$vnic" \
                   --menu "\n请选择要执行的操作：" \
                   15 50 5 \
                   1 "删除该网卡" \
                   2 "返回主菜单" \
                   3>&1 1>&2 2>&3)

    case $choice in
      1)
        delete_vnic "$vnic"
        return
        ;;
      2)
        return
        ;;
      *)
        return
        ;;
    esac
  done
}

# 删除网卡
delete_vnic() {
  vnic=$1
  dialog --title "危险操作" --yesno "\n确定要永久删除网卡 ${vnic} 吗？\n\n此操作不可恢复！" 10 50
  if [ $? -ne 0 ]; then
    return
  fi

  password=$(dialog --title "权限验证" \
                   --passwordbox "\n请输入管理员密码：" \
                   10 50 \
                   3>&1 1>&2 2>&3)

  if [ -z "$password" ]; then
    dialog --title "错误" --msgbox "\n密码不能为空" 8 40
    return
  fi

  echo "$password" | sudo -S ifconfig "$vnic" destroy 2>/tmp/error.log
  
  if [ $? -eq 0 ]; then
    dialog --title "操作成功" --msgbox "\n${vnic} 已成功删除" 10 40
  else
    error_msg=$(cat /tmp/error.log)
    dialog --title "操作失败" --msgbox "\n删除失败：\n${error_msg}" 12 50
  fi
  rm -f /tmp/error.log
}

# 主流程
check_dialog
main_menu
clear
echo -e "${GREEN}操作完成，程序已退出${NC}"