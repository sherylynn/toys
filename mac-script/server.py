#!/usr/bin/env python3
"""
ADB设备扫描和管理服务器
基于 scan.command 功能的 GUI 版本后端
"""

import subprocess
import threading
import json
import time
import socket
import re
import os
import ipaddress
import tempfile
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from socketserver import ThreadingMixIn
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

# 全局变量
scan_status = {
    "is_scanning": False,
    "progress": 0,
    "stage": "准备中",
    "found_devices": [],
    "connected_devices": [],
    "start_time": None,
    "end_time": None
}

# 配置
IP_HISTORY_FILE = os.path.join(os.path.dirname(__file__), "ip.txt")
ADB_PORT = 5555
MAX_WORKERS = 50

class ADBScanner:
    def __init__(self):
        self.ip_history_file = IP_HISTORY_FILE
        self.ensure_adb_running()
        
    def ensure_adb_running(self):
        """确保 ADB 服务正在运行"""
        try:
            subprocess.run(['adb', 'start-server'], check=True, capture_output=True)
            time.sleep(1)
        except subprocess.CalledProcessError:
            print("ADB 启动失败，请确保已安装 Android SDK Platform Tools")
    
    def get_local_ip(self):
        """获取本机内网 IP 地址"""
        try:
            result = subprocess.run(['ifconfig'], capture_output=True, text=True)
            # 简化正则表达式，分别匹配每种内网IP
            patterns = [
                r'inet (192\.168\.\d+\.\d+)',
                r'inet (10\.\d+\.\d+\.\d+)',
                r'inet (172\.(?:1[6-9]|2[0-9]|3[01])\.\d+\.\d+)'
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, result.stdout)
                if matches:
                    return matches[0]
            return None
        except Exception as e:
            print(f"获取本地IP失败: {e}")
            return None
    
    def ping_ip(self, ip):
        """检测 IP 是否在线"""
        try:
            result = subprocess.run(['ping', '-c', '1', '-W', '1', ip], 
                                  capture_output=True, timeout=2)
            return result.returncode == 0
        except:
            return False
    
    def check_port(self, ip, port=ADB_PORT):
        """检测端口是否开放"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(2)
                result = s.connect_ex((ip, port))
                return result == 0
        except:
            return False
    
    def adb_connect(self, ip):
        """ADB 连接设备"""
        try:
            result = subprocess.run(['adb', 'connect', f'{ip}:{ADB_PORT}'], 
                                  capture_output=True, text=True, timeout=5)
            return 'connected' in result.stdout.lower()
        except:
            return False
    
    def adb_disconnect(self, ip):
        """ADB 断开设备"""
        try:
            subprocess.run(['adb', 'disconnect', f'{ip}:{ADB_PORT}'], 
                          capture_output=True, timeout=3)
        except:
            pass
    
    def get_device_info(self, ip):
        """获取设备信息"""
        try:
            # 获取设备型号
            model = subprocess.run(['adb', '-s', f'{ip}:{ADB_PORT}', 'shell', 'getprop', 'ro.product.model'], 
                                 capture_output=True, text=True, timeout=3)
            model_name = model.stdout.strip() if model.returncode == 0 else "Unknown"
            
            # 获取设备制造商
            manufacturer = subprocess.run(['adb', '-s', f'{ip}:{ADB_PORT}', 'shell', 'getprop', 'ro.product.manufacturer'], 
                                       capture_output=True, text=True, timeout=3)
            manufacturer_name = manufacturer.stdout.strip() if manufacturer.returncode == 0 else "Unknown"
            
            return {
                "ip": ip,
                "model": model_name,
                "manufacturer": manufacturer_name,
                "connected": True,
                "last_seen": datetime.now().isoformat()
            }
        except:
            return {
                "ip": ip,
                "model": "Unknown",
                "manufacturer": "Unknown",
                "connected": False,
                "last_seen": datetime.now().isoformat()
            }
    
    def load_history_ips(self):
        """加载历史 IP 地址"""
        if os.path.exists(self.ip_history_file):
            try:
                with open(self.ip_history_file, 'r') as f:
                    return [line.strip() for line in f.readlines() if line.strip()]
            except:
                return []
        return []
    
    def save_history_ip(self, ip):
        """保存 IP 到历史记录"""
        try:
            existing_ips = self.load_history_ips()
            if ip not in existing_ips:
                existing_ips.append(ip)
                with open(self.ip_history_file, 'w') as f:
                    f.write('\n'.join(existing_ips))
        except:
            pass
    
    def direct_connect_attempt(self, ip, callback=None):
        """直接连接尝试 - 模拟 scan.command 的逻辑"""
        if callback:
            callback(0, f"尝试直接连接: {ip}:5555", [])
        
        # 检查端口是否开放
        if not self.check_port(ip):
            if callback:
                callback(0, f"端口未开放: {ip}", [])
            return None
        
        if callback:
            callback(0, f"端口开放，尝试ADB连接: {ip}", [])
        
        # 尝试ADB连接
        if self.adb_connect(ip):
            # 检查是否连接成功
            devices_result = subprocess.run(['adb', 'devices'], capture_output=True, text=True)
            if f'{ip}:5555' in devices_result.stdout and 'device' in devices_result.stdout:
                device_info = self.get_device_info(ip)
                if callback:
                    callback(0, f"成功连接到设备: {ip}", [device_info])
                return device_info
            else:
                self.adb_disconnect(ip)
        
        if callback:
            callback(0, f"ADB连接失败: {ip}", [])
        return None
    
    def fast_ping_scan(self, subnet, callback=None):
        """快速ping扫描 - 模拟 scan.command 的逻辑"""
        active_ips = []
        total_ips = 254
        scanned = 0
        
        if callback:
            callback(0, "执行快速ping扫描...", [])
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = []
            for i in range(1, 255):
                ip = f"{subnet}.{i}"
                future = executor.submit(self.ping_ip, ip)
                futures.append((future, ip))
            
            for future, ip in futures:
                try:
                    if future.result():
                        active_ips.append(ip)
                except:
                    pass
                
                scanned += 1
                progress = int((scanned / total_ips) * 30)  # ping扫描占30%
                if callback:
                    callback(progress, f"正在扫描 {subnet}.x 网段 ({scanned}/{total_ips})", active_ips)
        
        if callback:
            callback(30, f"发现 {len(active_ips)} 个活跃设备", active_ips)
        
        return active_ips
    
    def fast_port_scan(self, ips, callback=None):
        """快速端口扫描 - 模拟 scan.command 的逻辑"""
        open_ports = []
        total = len(ips)
        scanned = 0
        
        if callback:
            callback(30, "快速扫描5555端口...", [])
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = []
            for ip in ips:
                future = executor.submit(self.check_port, ip)
                futures.append((future, ip))
            
            for future, ip in futures:
                try:
                    if future.result():
                        open_ports.append(ip)
                except:
                    pass
                
                scanned += 1
                progress = 30 + int((scanned / total) * 40)  # 端口扫描占40%
                if callback:
                    callback(progress, f"正在扫描 {ADB_PORT} 端口 ({scanned}/{total})", open_ports)
        
        if callback:
            callback(70, f"发现 {len(open_ports)} 个开放5555端口的设备", open_ports)
        
        return open_ports
    
    def scan_devices(self, callback=None):
        """主扫描函数 - 完全模拟 scan.command 的逻辑"""
        scan_status["is_scanning"] = True
        scan_status["start_time"] = datetime.now().isoformat()
        scan_status["found_devices"] = []
        scan_status["connected_devices"] = []
        
        try:
            # 获取本地 IP
            local_ip = self.get_local_ip()
            if not local_ip:
                raise Exception("无法获取本地 IP 地址")
            
            subnet = '.'.join(local_ip.split('.')[:3])
            
            if callback:
                callback(0, f"本机IP地址: {local_ip}", [])
                callback(0, f"当前网段: {subnet}", [])
            
            # 优先尝试历史 IP
            history_ips = self.load_history_ips()
            if history_ips:
                if callback:
                    callback(0, "发现历史IP记录，优先尝试连接...", [])
                
                connected = False
                for ip in history_ips:
                    ip_subnet = '.'.join(ip.split('.')[:3])
                    if ip_subnet == subnet:
                        if callback:
                            callback(0, f"尝试连接同网段历史IP: {ip}", [])
                        
                        device_info = self.direct_connect_attempt(ip, callback)
                        if device_info:
                            scan_status["connected_devices"].append(device_info)
                            if callback:
                                callback(100, f"成功连接到历史设备: {ip}", [device_info])
                            
                            # 检查是否为目标设备（包含110）
                            if "110" in device_info["model"]:
                                if callback:
                                    callback(100, "找到目标设备！", [device_info])
                                
                                # 自动启动相关脚本
                                try:
                                    subprocess.Popen(['zsh', '-c', f'sc {ip}'])
                                    time.sleep(2)
                                    subprocess.Popen(['zsh', '-c', f'sca {ip}'])
                                    time.sleep(2)
                                    subprocess.Popen(['zsh', '-c', f'scb {ip}'])
                                except:
                                    pass
                            
                            connected = True
                            break
                
                if connected:
                    scan_status["found_devices"] = scan_status["connected_devices"]
                    return
            
            if callback:
                callback(0, "无法连接到任何历史IP，开始快速扫描...", [])
            
            # 方法1: 快速ping扫描 + 端口扫描
            if callback:
                callback(0, "=== 方法1: 快速ping扫描 + 端口扫描 ===", [])
            
            active_ips = self.fast_ping_scan(subnet, callback)
            
            if active_ips:
                open_ports = self.fast_port_scan(active_ips, callback)
                
                if open_ports:
                    if callback:
                        callback(70, "正在连接设备...", [])
                    
                    for ip in open_ports:
                        device_info = self.direct_connect_attempt(ip, callback)
                        if device_info:
                            scan_status["connected_devices"].append(device_info)
                            self.save_history_ip(ip)
                            
                            # 检查是否为目标设备（包含110）
                            if "110" in device_info["model"]:
                                if callback:
                                    callback(100, "找到目标设备！", [device_info])
                                
                                # 自动启动相关脚本
                                try:
                                    subprocess.Popen(['zsh', '-c', f'sc {ip}'])
                                    time.sleep(2)
                                    subprocess.Popen(['zsh', '-c', f'sca {ip}'])
                                    time.sleep(2)
                                    subprocess.Popen(['zsh', '-c', f'scb {ip}'])
                                except:
                                    pass
                                
                                break
                            else:
                                if callback:
                                    callback(70, "不是目标设备，断开连接", [])
                                self.adb_disconnect(ip)
            
            # 方法2: 超快速端口扫描 (直接扫描常见IP)
            if not scan_status["connected_devices"]:
                if callback:
                    callback(70, "=== 方法2: 超快速端口扫描 ===", [])
                    callback(70, "直接扫描常见IP地址...", [])
                
                # 常见IP列表
                common_ips = ["172.16.128.1", "172.16.128.2", "172.16.128.100", "172.16.128.200"]
                
                for ip in common_ips:
                    if callback:
                        callback(70, f"扫描: {ip}", [])
                    
                    device_info = self.direct_connect_attempt(ip, callback)
                    if device_info:
                        # 检查是否为目标设备（包含110）
                        if "110" in device_info["model"]:
                            if callback:
                                callback(100, "找到目标设备！", [device_info])
                            
                            self.save_history_ip(ip)
                            
                            # 自动启动相关脚本
                            try:
                                subprocess.Popen(['zsh', '-c', f'sc {ip}'])
                                time.sleep(2)
                                subprocess.Popen(['zsh', '-c', f'sca {ip}'])
                                time.sleep(2)
                                subprocess.Popen(['zsh', '-c', f'scb {ip}'])
                            except:
                                pass
                            
                            scan_status["connected_devices"].append(device_info)
                            break
                        else:
                            if callback:
                                callback(70, "不是目标设备，断开连接", [])
                            self.adb_disconnect(ip)
            
            scan_status["found_devices"] = scan_status["connected_devices"]
            
            if not scan_status["connected_devices"]:
                if callback:
                    callback(100, "扫描完成，未找到目标设备", [])
            
        except Exception as e:
            print(f"扫描过程中出现错误: {e}")
            if callback:
                callback(100, f"扫描错误: {e}", [])
        finally:
            scan_status["is_scanning"] = False
            scan_status["end_time"] = datetime.now().isoformat()
            if callback:
                callback(100, "扫描完成", scan_status["connected_devices"])

class ADBDeviceManager:
    def __init__(self):
        self.timeout = 3
        self.devices = []
        self.ip_history_file = os.path.join(os.path.dirname(__file__), 'ip.txt')
        self.scanner = ADBScanner()
        
    def scan_devices(self):
        """扫描局域网内的ADB设备 - 简化版本"""
        try:
            # 确保ADB服务运行
            subprocess.run(['adb', 'start-server'], capture_output=True, timeout=5)
            
            # 获取本地IP
            result = subprocess.run(['ifconfig'], capture_output=True, text=True)
            local_ip_match = re.search(r'inet (192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+)', result.stdout)
            
            if not local_ip_match:
                return {"success": False, "error": "无法获取本地IP地址"}
            
            local_ip = local_ip_match.group(1)
            subnet = '.'.join(local_ip.split('.')[:3])
            
            # 扫描当前网段的常见IP地址
            devices = []
            common_ips = [f"{subnet}.{i}" for i in range(100, 200)]  # 扫描100-199范围
            
            for ip in common_ips:
                try:
                    # 检查端口是否开放
                    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                        s.settimeout(1)
                        if s.connect_ex((ip, 5555)) == 0:
                            # 尝试ADB连接
                            connect_result = subprocess.run(
                                ['adb', 'connect', f'{ip}:5555'],
                                capture_output=True, text=True, timeout=3
                            )
                            
                            if 'connected' in connect_result.stdout.lower():
                                # 获取设备名称
                                name_result = subprocess.run(
                                    ['adb', '-s', f'{ip}:5555', 'shell', 'getprop', 'ro.product.model'],
                                    capture_output=True, text=True, timeout=3
                                )
                                
                                device_name = name_result.stdout.strip() if name_result.returncode == 0 else "Unknown Device"
                                
                                devices.append({
                                    'ip': ip,
                                    'name': device_name,
                                    'connected': False
                                })
                                
                                # 断开连接
                                subprocess.run(['adb', 'disconnect', f'{ip}:5555'], capture_output=True)
                                
                except (subprocess.TimeoutExpired, socket.timeout, Exception):
                    continue
            
            # 如果没有找到设备，尝试历史IP
            if not devices and os.path.exists(self.ip_history_file):
                try:
                    with open(self.ip_history_file, 'r') as f:
                        for line in f:
                            ip = line.strip()
                            if ip and self.is_valid_ip(ip):
                                try:
                                    # 检查历史IP
                                    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                                        s.settimeout(2)
                                        if s.connect_ex((ip, 5555)) == 0:
                                            devices.append({
                                                'ip': ip,
                                                'name': 'Historical Device',
                                                'connected': False
                                            })
                                except:
                                    continue
                except:
                    pass
            
            return {"success": True, "devices": devices}
            
        except Exception as e:
            return {"success": False, "error": f"扫描失败: {str(e)}"}
    
    def get_local_ip(self):
        """获取本机内网IP地址"""
        try:
            # 连接到一个外部地址来获取本地IP
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(('8.8.8.8', 80))
                local_ip = s.getsockname()[0]
            return local_ip
        except:
            # 回退方法
            import platform
            if platform.system() == 'Darwin':  # macOS
                result = subprocess.run(['ifconfig'], capture_output=True, text=True)
                for line in result.stdout.split('\n'):
                    if 'inet ' in line and '127.0.0.1' not in line:
                        ip = line.split('inet ')[1].split(' ')[0]
                        if ip.startswith(('192.168.', '10.', '172.')):
                            return ip
        return None
    
    def scan_historical_ips(self):
        """扫描历史IP地址"""
        devices = []
        
        if os.path.exists(self.ip_history_file):
            with open(self.ip_history_file, 'r') as f:
                for line in f:
                    ip = line.strip()
                    if ip and self.is_valid_ip(ip):
                        device_info = self.check_device(ip)
                        if device_info:
                            devices.append(device_info)
        
        return devices
    
    def scan_network(self, subnet):
        """扫描指定网段的设备"""
        devices = []
        
        # 快速扫描常见的IP范围
        common_ips = [f"{subnet}.{i}" for i in range(1, 255)]
        
        # 使用多线程并行扫描
        threads = []
        results = []
        
        def scan_ip(ip):
            device_info = self.check_device(ip)
            if device_info:
                results.append(device_info)
        
        for ip in common_ips:
            thread = threading.Thread(target=scan_ip, args=(ip,))
            threads.append(thread)
            thread.start()
            # 限制并发数
            if len(threads) >= 50:
                for t in threads:
                    t.join()
                threads = []
        
        # 等待剩余线程完成
        for thread in threads:
            thread.join()
        
        return results
    
    def check_device(self, ip):
        """检查指定IP是否为ADB设备"""
        try:
            # 检查端口5555是否开放
            if not self.is_port_open(ip, 5555):
                return None
            
            # 尝试ADB连接
            result = subprocess.run(
                ['adb', 'connect', f'{ip}:5555'],
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            
            # 检查是否连接成功
            device_result = subprocess.run(
                ['adb', 'devices'],
                capture_output=True,
                text=True
            )
            
            if f'{ip}:5555' in device_result.stdout and 'device' in device_result.stdout:
                # 获取设备名称
                device_name = self.get_device_name(ip)
                
                # 断开连接
                subprocess.run(['adb', 'disconnect', f'{ip}:5555'], 
                             capture_output=True)
                
                return {
                    'ip': ip,
                    'name': device_name or f'Unknown Device ({ip})',
                    'connected': False
                }
            
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
            pass
        except Exception as e:
            print(f"Error checking device {ip}: {e}")
        
        return None
    
    def is_port_open(self, ip, port):
        """检查指定IP的端口是否开放"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                result = s.connect_ex((ip, port))
                return result == 0
        except:
            return False
    
    def is_valid_ip(self, ip):
        """验证IP地址格式"""
        try:
            socket.inet_aton(ip)
            return True
        except socket.error:
            return False
    
    def get_device_name(self, ip):
        """获取设备名称"""
        try:
            result = subprocess.run(
                ['adb', '-s', f'{ip}:5555', 'shell', 'getprop', 'ro.product.model'],
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            if result.returncode == 0:
                return result.stdout.strip()
        except:
            pass
        return None
    
    def connect_device(self, ip, app='scrcpy'):
        """连接设备并启动指定应用"""
        try:
            # 连接设备
            result = subprocess.run(
                ['adb', 'connect', f'{ip}:5555'],
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            
            if 'unable' in result.stdout.lower():
                return {"success": False, "error": "无法连接到设备"}
            
            # 验证连接
            device_result = subprocess.run(
                ['adb', 'devices'],
                capture_output=True,
                text=True
            )
            
            if f'{ip}:5555' not in device_result.stdout or 'device' not in device_result.stdout:
                return {"success": False, "error": "ADB连接失败"}
            
            # 启动指定应用 - 实际调用scrcpy或相关脚本
            if app == 'scrcpy':
                # 使用scrcpy直接连接
                subprocess.Popen(['scrcpy', '-s', f'{ip}:5555'], 
                               stdout=subprocess.DEVNULL, 
                               stderr=subprocess.DEVNULL)
            elif app == 'sc':
                # 调用sc脚本
                subprocess.Popen(['zsh', '-c', f'sc {ip}'], 
                               stdout=subprocess.DEVNULL, 
                               stderr=subprocess.DEVNULL)
            elif app == 'sca':
                # 调用sca脚本
                subprocess.Popen(['zsh', '-c', f'sca {ip}'], 
                               stdout=subprocess.DEVNULL, 
                               stderr=subprocess.DEVNULL)
            elif app == 'scb':
                # 调用scb脚本
                subprocess.Popen(['zsh', '-c', f'scb {ip}'], 
                               stdout=subprocess.DEVNULL, 
                               stderr=subprocess.DEVNULL)
            
            # 添加到历史记录
            self.add_to_history(ip)
            
            return {"success": True, "message": f"设备 {ip} 连接成功，正在启动 {app}"}
            
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "连接超时"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def add_to_history(self, ip):
        """添加IP到历史记录"""
        try:
            if os.path.exists(self.ip_history_file):
                with open(self.ip_history_file, 'r') as f:
                    existing_ips = [line.strip() for line in f if line.strip()]
            else:
                existing_ips = []
            
            if ip not in existing_ips:
                existing_ips.append(ip)
                with open(self.ip_history_file, 'w') as f:
                    for existing_ip in existing_ips:
                        f.write(f"{existing_ip}\n")
        except Exception as e:
            print(f"Error adding to history: {e}")


class ADBRequestHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, manager=None, **kwargs):
        self.manager = manager
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """处理GET请求"""
        path = urlparse(self.path).path
        
        if path == '/status':
            self.send_json_response(scan_status)
        elif path == '/history':
            history_ips = self.manager.scanner.load_history_ips()
            self.send_json_response({"history": history_ips})
        elif path == '/devices':
            try:
                result = subprocess.run(['adb', 'devices'], capture_output=True, text=True)
                devices = []
                for line in result.stdout.split('\n')[1:]:
                    if line.strip():
                        parts = line.split('\t')
                        if len(parts) >= 2:
                            ip = parts[0].replace(':5555', '')
                            status = parts[1]
                            devices.append({"ip": ip, "status": status})
                self.send_json_response({"devices": devices})
            except:
                self.send_json_response({"devices": []})
        else:
            self.serve_file(path)
    
    def do_POST(self):
        """处理POST请求"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            path = urlparse(self.path).path
            
            if path == '/scan':
                if not scan_status["is_scanning"]:
                    def scan_thread():
                        def progress_callback(progress, stage, devices):
                            scan_status["progress"] = progress
                            scan_status["stage"] = stage
                            scan_status["found_devices"] = devices
                        
                        scan_status["is_scanning"] = True
                        scan_status["start_time"] = datetime.now().isoformat()
                        scan_status["progress"] = 0
                        scan_status["stage"] = "正在扫描"
                        scan_status["found_devices"] = []
                        
                        try:
                            # 使用新的扫描方法，完全模拟 scan.command
                            self.manager.scanner.scan_devices(progress_callback)
                        except Exception as e:
                            print(f"扫描异常: {e}")
                            scan_status["stage"] = f"扫描错误: {e}"
                        finally:
                            scan_status["is_scanning"] = False
                            scan_status["progress"] = 100
                            scan_status["stage"] = "扫描完成"
                            scan_status["end_time"] = datetime.now().isoformat()
                    
                    threading.Thread(target=scan_thread).start()
                    self.send_json_response({"message": "扫描已开始"})
                else:
                    self.send_json_response({"message": "扫描正在进行中"})
            
            elif path == '/connect':
                ip = data.get('ip')
                if not ip:
                    self.send_json_response({"error": "缺少 IP 地址"}, 400)
                    return
                
                try:
                    if self.manager.scanner.adb_connect(ip):
                        device_info = self.manager.scanner.get_device_info(ip)
                        self.manager.scanner.save_history_ip(ip)
                        self.send_json_response({"message": "连接成功", "device": device_info})
                    else:
                        self.send_json_response({"error": "连接失败"}, 400)
                except Exception as e:
                    self.send_json_response({"error": str(e)}, 500)
            
            elif path == '/disconnect':
                ip = data.get('ip')
                if not ip:
                    self.send_json_response({"error": "缺少 IP 地址"}, 400)
                    return
                
                try:
                    self.manager.scanner.adb_disconnect(ip)
                    self.send_json_response({"message": "已断开连接"})
                except Exception as e:
                    self.send_json_response({"error": str(e)}, 500)
            
            elif path == '/launch-scrcpy':
                ip = data.get('ip')
                mode = data.get('mode', 'sc')
                
                if not ip:
                    self.send_json_response({"error": "缺少 IP 地址"}, 400)
                    return
                
                try:
                    subprocess.Popen(['zsh', '-c', f'{mode} {ip}'])
                    self.send_json_response({"message": f"已启动 {mode}"})
                except Exception as e:
                    self.send_json_response({"error": str(e)}, 500)
            
            elif path == '/scan-devices':
                self.manager.timeout = int(data.get('timeout', 3))
                result = self.manager.scan_devices()
                self.send_json_response(result)
            
            elif path == '/connect-device':
                ip = data.get('ip')
                app = data.get('app', 'scrcpy')
                result = self.manager.connect_device(ip, app)
                self.send_json_response(result)
            
            else:
                self.send_json_response({"success": False, "error": "未知路径"}, 404)
            
        except json.JSONDecodeError:
            self.send_json_response({"success": False, "error": "无效的JSON数据"}, 400)
        except Exception as e:
            self.send_json_response({"success": False, "error": str(e)}, 500)
    
    def serve_file(self, path):
        """提供静态文件服务"""
        if path == '/':
            path = '/gui.html'
        
        file_path = os.path.join(os.path.dirname(__file__), path.lstrip('/'))
        
        if os.path.exists(file_path):
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                self.send_response(200)
                
                if file_path.endswith('.html'):
                    self.send_header('Content-type', 'text/html')
                elif file_path.endswith('.css'):
                    self.send_header('Content-type', 'text/css')
                elif file_path.endswith('.js'):
                    self.send_header('Content-type', 'application/javascript')
                else:
                    self.send_header('Content-type', 'application/octet-stream')
                
                self.send_header('Content-Length', str(len(content)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content)
            except Exception as e:
                self.send_error(500, f"File read error: {str(e)}")
        else:
            self.send_error(404, "File not found")
    
    def send_json_response(self, data, status_code=200):
        """发送JSON响应"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def do_OPTIONS(self):
        """处理OPTIONS请求（CORS预检）"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """禁用日志输出"""
        pass


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """多线程HTTP服务器"""
    pass


def main():
    # 创建设备管理器
    manager = ADBDeviceManager()
    
    # 创建请求处理器工厂
    def create_handler(*args, **kwargs):
        return ADBRequestHandler(*args, manager=manager, **kwargs)
    
    # 启动服务器
    server = ThreadedHTTPServer(('localhost', 8080), create_handler)
    
    print("ADB设备扫描服务器启动在 http://localhost:8080")
    print("按 Ctrl+C 停止服务器")
    
    # 在新线程中启动GUI
    def open_gui():
        time.sleep(1)  # 等待服务器启动
        import webbrowser
        webbrowser.open('http://localhost:8080')
    
    gui_thread = threading.Thread(target=open_gui)
    gui_thread.daemon = True
    gui_thread.start()
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器停止")
        server.shutdown()


if __name__ == '__main__':
    main()