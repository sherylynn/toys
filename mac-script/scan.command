#!/bin/zsh

# 检查adb是否运行
if ! pgrep -x "adb" > /dev/null; then
    echo "ADB服务未运行，正在启动..."
    adb start-server
fi

# 定义历史IP文件路径
ip_history_file="$(dirname $0)/ip.txt"

# 如果历史IP文件存在，先尝试连接历史IP
if [ -f "$ip_history_file" ]; then
    echo "发现历史IP记录，优先尝试连接..."
    connected=false
    
    while IFS= read -r ip || [ -n "$ip" ]; do
        echo "\n尝试连接历史IP: $ip"
        adb connect $ip:5555
        sleep 2
        
        if adb devices | grep -q "$ip:5555.*device"; then
            echo "成功连接到设备: $ip"
            sc $ip &
            sleep 2
            sca $ip &
            sleep 2 
            scb $ip
            connected=true
            break
        else
            echo "无法连接到历史IP: $ip"
        fi
    done < "$ip_history_file"
    
    if [ "$connected" = true ]; then
        exit 0
    fi
    echo "\n无法连接到任何历史IP，开始扫描网络..."
fi

# 获取本机192.168.x.x网段的IP地址
local_ip=$(ifconfig | grep "inet " | grep "192\.168\." | awk '{print $2}' | head -n 1)

# 如果没有找到192.168.x.x网段的IP地址
if [ -z "$local_ip" ]; then
    echo "错误：未找到192.168.x.x网段的IP地址"
    echo "请确保您的设备已连接到正确的网络"
    exit 1
fi

subnet=$(echo $local_ip | cut -d. -f1-3)
subnet_range="$subnet.0/24"

echo "本机IP地址(192.168.x.x): $local_ip"
echo "扫描范围: $subnet_range"
echo "正在扫描局域网内开启5555端口的设备..."

# 使用nmap扫描局域网内开启5555端口的设备，增加详细输出
echo "\n开始扫描..."
nmap_output=$(nmap -p 5555 -v --open $subnet_range)

# 显示扫描进度和结果
echo "$nmap_output" | grep "Scanning" | sed 's/Scanning/正在扫描:/g'

# 提取所有已扫描的IP地址
scanned_ips=$(echo "$nmap_output" | grep "Scanning" | awk '{print $2}')
echo "\n已扫描的IP地址:"
echo "$scanned_ips"

# 提取开放5555端口的设备的IP地址到数组
devices=($(echo "$nmap_output" | grep "5555/tcp" -B 4 | grep "Nmap scan" | awk '{print $NF}' | sed 's/[()]//g'))

if [ ${#devices[@]} -eq 0 ]; then
    echo "\n扫描完成，未找到开启5555端口的设备"
    echo "请检查以下几点："
    echo "1. 确保设备已开启ADB无线调试"
    echo "2. 确保设备上的无线调试端口设置为5555"
    echo "3. 确保设备和电脑在同一个网络下"
    echo "4. 如果确认设备已正确配置，可以尝试手动连接：adb connect <设备IP>:5555"
    exit 1
fi

echo "\n找到以下开启5555端口的设备："
printf "%s\n" "${devices[@]}"

# 尝试连接每个设备
for device in "${devices[@]}"; do
    echo "\n尝试连接设备: $device"
    adb connect "$device:5555"
    sleep 2
    
    # 检查连接状态
    if adb devices | grep -q "$device:5555.*device"; then
        echo "成功连接到设备: $device"
        
        # 获取设备名称
        device_name=$(adb -s "$device:5555" shell getprop ro.product.model 2>/dev/null)
        echo "设备型号: $device_name"
        
        # 检查设备名称是否包含110
        if [[ "$device_name" == *"110"* ]]; then
            echo "找到目标设备！"
            # 将成功连接的IP添加到历史记录文件（如果不存在）
            if ! grep -q "^$device$" "$ip_history_file" 2>/dev/null; then
                echo "$device" >> "$ip_history_file"
                echo "已将IP添加到历史记录"
            fi
            sc "$device" &
            sleep 2
            sca "$device" &
            sleep 2
            scb "$device"
        else
            echo "不是目标设备，断开连接"
            adb disconnect "$device:5555"
        fi
    else
        echo "无法连接到设备: $device"
    fi
done

sleep 3