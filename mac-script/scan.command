#!/bin/zsh

# 记录开始时间
start_time=$(date +%s)

echo "=== ADB设备快速扫描工具 ==="
echo "开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 检查adb是否运行
if ! pgrep -x "adb" > /dev/null; then
    echo "ADB服务未运行，正在启动..."
    adb start-server
    sleep 1
fi

# 定义历史IP文件路径
ip_history_file="$(dirname $0)/ip.txt"

# 直接连接尝试函数
direct_connect_attempt() {
    local target_ip=$1
    echo "尝试直接连接: $target_ip:5555"
    
    if timeout 3 bash -c "echo >/dev/tcp/$target_ip/5555" 2>/dev/null; then
        echo "✓ 端口开放，尝试ADB连接..."
        adb connect "$target_ip:5555"
        sleep 2
        
        if adb devices | grep -q "$target_ip:5555.*device"; then
            echo "✓ 成功连接到设备: $target_ip"
            return 0
        else
            echo "✗ ADB连接失败"
            adb disconnect "$target_ip:5555" 2>/dev/null
        fi
    else
        echo "✗ 端口未开放"
    fi
    return 1
}

# 快速ping扫描函数
fast_ping_scan() {
    local subnet=$1
    echo "执行快速ping扫描..."
    local total=254
    local start_time=$(date +%s)
    local -a active_ips=()
    local completed=0

    # 清理临时文件
    rm -f /tmp/active_ips_$$.txt /tmp/ping_done_$$.txt

    # 并行ping所有IP
    for i in {1..254}; do
        (
            if ping -c 1 -W 1 "$subnet.$i" > /dev/null 2>&1; then
                echo "$subnet.$i" >> /tmp/active_ips_$$.txt
            fi
            # 标记完成
            echo "done" >> /tmp/ping_done_$$.txt
        ) &
    done

    # 进度条显示
    while [ $completed -lt $total ]; do
        # 计算已完成数量
        if [ -f /tmp/ping_done_$$.txt ]; then
            completed=$(wc -l < /tmp/ping_done_$$.txt 2>/dev/null || echo 0)
        fi
        
        # 计算发现的设备数量
        local found=0
        if [ -f /tmp/active_ips_$$.txt ]; then
            found=$(wc -l < /tmp/active_ips_$$.txt 2>/dev/null || echo 0)
        fi
        
        local elapsed=$(( $(date +%s) - start_time ))
        local percent=$(( completed * 100 / total ))
        local width=40
        local filled=$(( width * completed / total ))
        local empty=$(( width - filled ))
        local bar=$(printf '%*s' $filled | tr ' ' '█')
        bar+=$(printf '%*s' $empty | tr ' ' '░')
        printf "\r[%-40s] %3d%% (%d/%d) 发现:%d 耗时:%ds" "$bar" "$percent" "$completed" "$total" "$found" "$elapsed"
        
        sleep 0.3
    done
    wait
    echo

    # 收集活跃IP
    if [ -f /tmp/active_ips_$$.txt ]; then
        active_ips=($(cat /tmp/active_ips_$$.txt))
        rm -f /tmp/active_ips_$$.txt
    fi
    rm -f /tmp/ping_done_$$.txt
    
    echo "发现 ${#active_ips[@]} 个活跃设备"
    printf "%s\n" "${active_ips[@]}"
    # 将结果写入文件供调用者读取
    printf "%s\n" "${active_ips[@]}" > /tmp/scan_result_$$.txt
}

# 快速端口扫描函数
fast_port_scan() {
    local ips=("$@")
    local port=5555
    local timeout=2
    local total=${#ips[@]}
    local current=0
    local start_time=$(date +%s)
    local devices=()
    echo "快速扫描5555端口..."
    # 清理临时文件
    rm -f /tmp/found_devices.txt

    for ip in "${ips[@]}"; do
        (
            if timeout $timeout bash -c "echo >/dev/tcp/$ip/$port" 2>/dev/null; then
                echo "$ip" >> /tmp/found_devices.txt
            fi
        ) &
    done

    # 进度条显示
    while :; do
        if [ -f /tmp/found_devices.txt ]; then
            current=$(wc -l < /tmp/found_devices.txt)
        else
            current=0
        fi
        elapsed=$(( $(date +%s) - start_time ))
        percent=$(( current * 100 / total ))
        width=40
        filled=$(( width * current / total ))
        empty=$(( width - filled ))
        bar=$(printf '%*s' $filled | tr ' ' '█')
        bar+=$(printf '%*s' $empty | tr ' ' '░')
        printf "\r[%-40s] %3d%% (%d/%d) 耗时:%ds" "$bar" "$percent" "$current" "$total" "$elapsed"
        sleep 0.5
        jobs | grep -q Running || break
    done
    wait
    echo

    # 读取发现的设备
    if [ -f /tmp/found_devices.txt ]; then
        while IFS= read -r ip; do
            devices+=("$ip")
        done < /tmp/found_devices.txt
        rm -f /tmp/found_devices.txt
    fi
    echo "发现 ${#devices[@]} 个开放5555端口的设备"
    # 将结果写入文件供调用者读取
    printf "%s\n" "${devices[@]}" > /tmp/port_result_$$.txt
}

# 获取本机常见内网网段的IP地址（支持192.168/10/172.16-31）
local_ip=$(ifconfig | grep "inet " | grep -E "192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\." | awk '{print $2}' | head -n 1)

# 如果没有找到常见内网网段的IP地址
if [ -z "$local_ip" ]; then
    echo "错误：未找到常见内网网段的IP地址"
    echo "请确保您的设备已连接到正确的网络"
    exit 1
fi

echo "本机IP地址: $local_ip"

# 如果历史IP文件存在，先尝试连接历史IP
if [ -f "$ip_history_file" ]; then
    echo "发现历史IP记录，优先尝试连接..."
    connected=false
    
    # 获取当前设备的网段
    current_subnet=$(echo $local_ip | cut -d. -f1-3)
    echo "当前网段: $current_subnet"

    # 读取所有历史IP并按网段排序
    while IFS= read -r ip || [ -n "$ip" ]; do
        if [ -n "$ip" ]; then
            ip_subnet=$(echo $ip | cut -d. -f1-3)
            if [ "$ip_subnet" = "$current_subnet" ]; then
                echo "\n尝试连接同网段历史IP: $ip"
                if direct_connect_attempt "$ip"; then
                    echo "成功连接到历史设备: $ip"
                    sc "$ip" &
                    sleep 2
                    sca "$ip" &
                    sleep 2 
                    scb "$ip"
                    connected=true
                    break
                fi
            fi
        fi
    done < "$ip_history_file"

    if [ "$connected" = true ]; then
        end_time=$(date +%s)
        total_time=$((end_time - start_time))
        echo "\n=== 扫描完成 ==="
        echo "总耗时: ${total_time}秒"
        echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
        exit 0
    fi
    echo "\n无法连接到任何历史IP，开始快速扫描..."
fi

# 自动识别网段
subnet=$(echo $local_ip | awk -F. '{print $1"."$2"."$3}')

# 方法1: 快速ping扫描 + 端口扫描
echo "\n=== 方法1: 快速ping扫描 + 端口扫描 ==="
fast_ping_scan $subnet
# 读取结果
active_ips=()
if [ -f /tmp/scan_result_$$.txt ]; then
    active_ips=($(cat /tmp/scan_result_$$.txt))
    rm -f /tmp/scan_result_$$.txt
fi
if [ ${#active_ips[@]} -gt 0 ]; then
    fast_port_scan "${active_ips[@]}"
    # 读取端口扫描结果
    devices=()
    if [ -f /tmp/port_result_$$.txt ]; then
        devices=($(cat /tmp/port_result_$$.txt))
        rm -f /tmp/port_result_$$.txt
    fi
    if [ ${#devices[@]} -gt 0 ]; then
        echo "\n找到以下开启5555端口的设备："
        printf "%s\n" "${devices[@]}"
        
        # 尝试连接每个设备
        for device in "${devices[@]}"; do
            if direct_connect_attempt "$device"; then
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
                    
                    end_time=$(date +%s)
                    total_time=$((end_time - start_time))
                    echo "\n=== 扫描完成 ==="
                    echo "总耗时: ${total_time}秒"
                    echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
                    exit 0
                else
                    echo "不是目标设备，断开连接"
                    adb disconnect "$device:5555"
                fi
            fi
        done
    fi
fi

# 方法2: 超快速端口扫描 (直接扫描常见IP)
echo "\n=== 方法2: 超快速端口扫描 ==="
echo "直接扫描常见IP地址..."

# 常见IP列表
common_ips=("172.16.128.1" "172.16.128.2" "172.16.128.100" "172.16.128.200")

for ip in "${common_ips[@]}"; do
    echo "扫描: $ip"
    if direct_connect_attempt "$ip"; then
        # 获取设备名称
        device_name=$(adb -s "$ip:5555" shell getprop ro.product.model 2>/dev/null)
        echo "设备型号: $device_name"
        
        # 检查设备名称是否包含110
        if [[ "$device_name" == *"110"* ]]; then
            echo "找到目标设备！"
            # 将成功连接的IP添加到历史记录文件（如果不存在）
            if ! grep -q "^$ip$" "$ip_history_file" 2>/dev/null; then
                echo "$ip" >> "$ip_history_file"
                echo "已将IP添加到历史记录"
            fi
            sc "$ip" &
            sleep 2
            sca "$ip" &
            sleep 2
            scb "$ip"
            
            end_time=$(date +%s)
            total_time=$((end_time - start_time))
            echo "\n=== 扫描完成 ==="
            echo "总耗时: ${total_time}秒"
            echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
            exit 0
        else
            echo "不是目标设备，断开连接"
            adb disconnect "$ip:5555"
        fi
    fi
done

echo "\n扫描完成，未找到目标设备"
echo "请检查以下几点："
echo "1. 确保设备已开启ADB无线调试"
echo "2. 确保设备上的无线调试端口设置为5555"
echo "3. 确保设备和电脑在同一个网络下"
echo "4. 检查防火墙设置是否阻止了5555端口"
echo "5. 尝试手动连接：adb connect <设备IP>:5555"

end_time=$(date +%s)
total_time=$((end_time - start_time))
echo "\n=== 扫描完成 ==="
echo "总耗时: ${total_time}秒"
echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"