package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

const (
	ADBPort    = 5555
	MaxTimeout = 2 * time.Second
)

// 扫描指定IP和端口
func scanPort(ip string, port int, timeout time.Duration) bool {
	target := fmt.Sprintf("%s:%d", ip, port)
	conn, err := net.DialTimeout("tcp", target, timeout)
	if err != nil {
		return false
	}
	defer conn.Close()
	return true
}

// 获取本机IP地址
func getLocalIP() (string, error) {
	interfaces, err := net.Interfaces()
	if err != nil {
		return "", err
	}

	for _, iface := range interfaces {
		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}

		for _, addr := range addrs {
			ipNet, ok := addr.(*net.IPNet)
			if ok && !ipNet.IP.IsLoopback() && ipNet.IP.To4() != nil {
				ip := ipNet.IP.String()
				if strings.HasPrefix(ip, "192.168.") {
					return ip, nil
				}
			}
		}
	}

	return "", fmt.Errorf("未找到192.168.x.x网段的IP地址")
}

// 扫描网段内所有开放5555端口的设备
func scanNetwork(subnet string) []string {
	var devices []string
	var wg sync.WaitGroup
	var mutex sync.Mutex

	for i := 1; i < 255; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			ip := fmt.Sprintf("%s.%d", subnet, i)
			if scanPort(ip, ADBPort, MaxTimeout) {
				mutex.Lock()
				devices = append(devices, ip)
				mutex.Unlock()
			}
		}(i)
	}

	wg.Wait()
	return devices
}

// 从历史记录文件中读取IP
func readHistoryIPs(filePath string) ([]string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var ips []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		ip := strings.TrimSpace(scanner.Text())
		if ip != "" {
			ips = append(ips, ip)
		}
	}

	return ips, scanner.Err()
}

// 连接ADB设备并检查设备信息
func connectAndCheckDevice(ip string) bool {
	target := fmt.Sprintf("%s:%d", ip, ADBPort)
	cmd := exec.Command("adb", "connect", target)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return false
	}

	// 等待设备连接
	time.Sleep(2 * time.Second)

	// 检查设备连接状态
	cmd = exec.Command("adb", "devices")
	output, err = cmd.CombinedOutput()
	if err != nil || !strings.Contains(string(output), target) {
		return false
	}

	// 获取设备型号
	cmd = exec.Command("adb", "-s", target, "shell", "getprop", "ro.product.model")
	output, err = cmd.CombinedOutput()
	if err != nil {
		return false
	}

	deviceName := strings.TrimSpace(string(output))
	fmt.Printf("设备型号: %s\n", deviceName)

	return true
}

func main() {
	// 获取本机IP
	localIP, err := getLocalIP()
	if err != nil {
		fmt.Printf("错误：%v\n", err)
		os.Exit(1)
	}

	// 获取当前网段
	subnet := localIP[:strings.LastIndex(localIP, ".")]
	fmt.Printf("本机IP地址: %s\n", localIP)
	fmt.Printf("扫描范围: %s.0/24\n", subnet)

	// 获取历史IP文件路径
	execPath, err := os.Executable()
	if err != nil {
		fmt.Printf("错误：无法获取执行文件路径 %v\n", err)
		os.Exit(1)
	}
	ipHistoryFile := filepath.Join(filepath.Dir(execPath), "ip.txt")

	// 尝试读取历史IP
	historyIPs, err := readHistoryIPs(ipHistoryFile)
	if err == nil && len(historyIPs) > 0 {
		fmt.Println("发现历史IP记录，优先尝试连接...")
		for _, ip := range historyIPs {
			if strings.HasPrefix(ip, subnet) {
				fmt.Printf("\n尝试连接同网段历史IP: %s\n", ip)
				if scanPort(ip, ADBPort, MaxTimeout) {
					fmt.Printf("成功连接到设备: %s\n", ip)
					if connectAndCheckDevice(ip) {
						os.Exit(0)
					}
				}
			}
		}
		fmt.Println("\n无法连接到任何历史IP，开始扫描网络...")
	}

	// 扫描网络
	fmt.Println("正在扫描局域网内开启5555端口的设备...")
	devices := scanNetwork(subnet)

	if len(devices) == 0 {
		fmt.Println("\n扫描完成，未找到开启5555端口的设备")
		fmt.Println("请检查以下几点：")
		fmt.Println("1. 确保设备已开启ADB无线调试")
		fmt.Println("2. 确保设备上的无线调试端口设置为5555")
		fmt.Println("3. 确保设备和电脑在同一个网络下")
		fmt.Println("4. 如果确认设备已正确配置，可以尝试手动连接：adb connect <设备IP>:5555")
		os.Exit(1)
	}

	fmt.Println("\n找到以下开启5555端口的设备：")
	for _, device := range devices {
		fmt.Println(device)
		if connectAndCheckDevice(device) {
			// 将成功连接的IP添加到历史记录文件（如果不存在）
			if !containsIP(historyIPs, device) {
				if f, err := os.OpenFile(ipHistoryFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644); err == nil {
					fmt.Fprintln(f, device)
					f.Close()
					fmt.Println("已将IP添加到历史记录")
				}
			}
			os.Exit(0)
		}
	}
}

// 检查IP是否在历史记录中
func containsIP(ips []string, ip string) bool {
	for _, existingIP := range ips {
		if existingIP == ip {
			return true
		}
	}
	return false
}