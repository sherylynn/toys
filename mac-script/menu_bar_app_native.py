#!/usr/bin/env python3
"""
macOS Menu Bar ADB Device Manager using PyObjC
使用PyObjC实现的macOS状态栏ADB设备管理器
"""

import sys
import os
import subprocess
import threading
import time
import json
from pathlib import Path
from AppKit import *
from PyObjCTools import AppHelper
import objc

# 检查是否在macOS上运行
if sys.platform != 'darwin':
    print("此应用程序仅支持macOS")
    sys.exit(1)

class ADBMenuBarController(NSObject):
    def init(self):
        self = objc.super(ADBMenuBarController, self).init()
        if self is None:
            return None
        
        self.devices = []
        self.scanning = False
        self.scan_thread = None
        self.device_control_items = []
        
        # 获取脚本所在目录
        self.script_dir = Path(__file__).parent
        
        # 创建状态栏
        self.status_bar = NSStatusBar.systemStatusBar()
        self.status_item = self.status_bar.statusItemWithLength_(NSVariableStatusItemLength)
        
        # 设置图标和标题
        self.status_item.setTitle_("📱")
        self.status_item.setHighlightMode_(True)
        
        # 创建菜单
        self.create_menu()
        
        # 启动时刷新设备列表
        self.refresh_devices()
        
        return self
    
    def create_menu(self):
        """创建菜单"""
        menu = NSMenu.alloc().init()
        
        # 刷新设备
        refresh_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("🔄 刷新设备", "refreshDevices:", "")
        refresh_item.setTarget_(self)
        menu.addItem_(refresh_item)
        
        # 扫描设备
        scan_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("🔍 扫描设备", "scanDevices:", "")
        scan_item.setTarget_(self)
        menu.addItem_(scan_item)
        
        # 分隔线
        menu.addItem_(NSMenuItem.separatorItem())
        
        # 设备列表（动态创建）
        self.device_menu_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("设备列表 (0)", "", "")
        menu.addItem_(self.device_menu_item)
        
        # 设备列表子菜单
        self.device_menu = NSMenu.alloc().init()
        self.device_menu_item.setSubmenu_(self.device_menu)
        
        # 分隔线
        menu.addItem_(NSMenuItem.separatorItem())
        
        # 设置
        settings_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("⚙️ 设置", "showSettings:", "")
        settings_item.setTarget_(self)
        menu.addItem_(settings_item)
        
        # 历史记录
        history_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("📋 历史记录", "showHistory:", "")
        history_item.setTarget_(self)
        menu.addItem_(history_item)
        
        # 分隔线
        menu.addItem_(NSMenuItem.separatorItem())
        
        # 启动GUI服务器
        start_gui_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("🚀 启动GUI服务器", "startGUIServer:", "")
        start_gui_item.setTarget_(self)
        menu.addItem_(start_gui_item)
        
        # 停止GUI服务器
        stop_gui_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("🛑 停止GUI服务器", "stopGUIServer:", "")
        stop_gui_item.setTarget_(self)
        menu.addItem_(stop_gui_item)
        
        # 分隔线
        menu.addItem_(NSMenuItem.separatorItem())
        
        # 退出
        quit_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("❌ 退出", "quitApp:", "")
        quit_item.setTarget_(self)
        menu.addItem_(quit_item)
        
        # 设置菜单
        self.status_item.setMenu_(menu)
    
    def refreshDevices_(self, sender):
        """刷新设备列表"""
        self.refresh_devices()
    
    def scanDevices_(self, sender):
        """扫描设备"""
        self.scan_devices()
    
    def showSettings_(self, sender):
        """显示设置"""
        self.show_settings()
    
    def showHistory_(self, sender):
        """显示历史记录"""
        self.show_history()
    
    def startGUIServer_(self, sender):
        """启动GUI服务器"""
        self.start_gui_server()
    
    def stopGUIServer_(self, sender):
        """停止GUI服务器"""
        self.stop_gui_server()
    
    def quitApp_(self, sender):
        """退出应用"""
        NSApp.terminate_(self)
    
    def run_adb_command(self, command, timeout=10):
        """运行ADB命令"""
        try:
            result = subprocess.run(
                ['adb'] + command,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            return result.returncode == 0, result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            return False, "", "命令超时"
        except FileNotFoundError:
            return False, "", "ADB命令未找到，请确保已安装Android SDK Platform Tools"
    
    def refresh_devices(self):
        """刷新设备列表"""
        success, output, error = self.run_adb_command(['devices'])
        
        if not success:
            self.show_alert(f"ADB命令失败: {error}")
            return
        
        # 解析设备列表
        lines = output.strip().split('\n')[1:]  # 跳过标题行
        self.devices = []
        
        for line in lines:
            if line.strip():
                parts = line.split('\t')
                if len(parts) >= 2:
                    device_id = parts[0]
                    status = parts[1]
                    
                    # 获取设备详细信息
                    device_info = self.get_device_info(device_id)
                    self.devices.append({
                        'id': device_id,
                        'status': status,
                        'info': device_info
                    })
        
        self.update_device_menu()
        
        # 更新状态栏标题
        self.status_item.setTitle_(f"📱 ({len(self.devices)})")
    
    def get_device_info(self, device_id):
        """获取设备详细信息"""
        info = {'model': 'Unknown', 'manufacturer': 'Unknown'}
        
        # 获取设备型号
        success, model_output, _ = self.run_adb_command(['-s', device_id, 'shell', 'getprop', 'ro.product.model'])
        if success and model_output.strip():
            info['model'] = model_output.strip()
        
        # 获取设备制造商
        success, manufacturer_output, _ = self.run_adb_command(['-s', device_id, 'shell', 'getprop', 'ro.product.manufacturer'])
        if success and manufacturer_output.strip():
            info['manufacturer'] = manufacturer_output.strip()
        
        return info
    
    def update_device_menu(self):
        """更新设备菜单 - 智能菜单层级"""
        # 清理之前添加的菜单项
        self.cleanup_device_control_items()
        
        # 清空设备菜单
        self.device_menu.removeAllItems()
        
        if not self.devices:
            # 无设备时显示在主菜单
            self.device_menu_item.setTitle_("无设备连接")
            self.device_menu_item.setSubmenu_(None)
            self.device_menu_item.setAction_(None)
            return
        
        # 根据设备数量决定菜单结构
        if len(self.devices) == 1:
            # 只有一个设备时，直接在主菜单显示控制命令
            device = self.devices[0]
            device_name = f"{device['info']['model']} ({device['id']})"
            self.device_menu_item.setTitle_(device_name)
            self.device_menu_item.setSubmenu_(None)
            self.device_menu_item.setAction_(None)
            
            # 直接在设备菜单项后添加控制命令
            parent_menu = self.device_menu_item.menu()
            device_index = parent_menu.indexOfItem_(self.device_menu_item)
            
            # Scrcpy
            scrcpy_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("📱 Scrcpy", "launchScrcpy:", "")
            scrcpy_item.setTarget_(self)
            scrcpy_item.setRepresentedObject_(device['id'])
            parent_menu.insertItem_atIndex_(scrcpy_item, device_index + 1)
            self.device_control_items.append(scrcpy_item)
            
            # SC
            sc_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("🟢 SC", "launchSC:", "")
            sc_item.setTarget_(self)
            sc_item.setRepresentedObject_(device['id'])
            parent_menu.insertItem_atIndex_(sc_item, device_index + 2)
            self.device_control_items.append(sc_item)
            
            # SCA
            sca_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("🟡 SCA", "launchSCA:", "")
            sca_item.setTarget_(self)
            sca_item.setRepresentedObject_(device['id'])
            parent_menu.insertItem_atIndex_(sca_item, device_index + 3)
            self.device_control_items.append(sca_item)
            
            # SCB
            scb_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("🔴 SCB", "launchSCB:", "")
            scb_item.setTarget_(self)
            scb_item.setRepresentedObject_(device['id'])
            parent_menu.insertItem_atIndex_(scb_item, device_index + 4)
            self.device_control_items.append(scb_item)
            
            # 断开连接
            disconnect_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("🔌 断开连接", "disconnectDevice:", "")
            disconnect_item.setTarget_(self)
            disconnect_item.setRepresentedObject_(device['id'])
            parent_menu.insertItem_atIndex_(disconnect_item, device_index + 5)
            self.device_control_items.append(disconnect_item)
            
            # 添加分隔线
            separator = NSMenuItem.separatorItem()
            parent_menu.insertItem_atIndex_(separator, device_index + 6)
            self.device_control_items.append(separator)
            
        else:
            # 多个设备时使用三级菜单结构
            self.device_menu_item.setTitle_(f"设备列表 ({len(self.devices)})")
            self.device_menu_item.setSubmenu_(self.device_menu)
            self.device_menu_item.setAction_(None)
            
            for device in self.devices:
                device_name = f"{device['info']['model']} ({device['id']})"
                device_menu_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_(device_name, "", "")
                
                # 创建设备操作子菜单
                device_submenu = NSMenu.alloc().init()
                
                # Scrcpy
                scrcpy_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("📱 Scrcpy", "launchScrcpy:", "")
                scrcpy_item.setTarget_(self)
                scrcpy_item.setRepresentedObject_(device['id'])
                device_submenu.addItem_(scrcpy_item)
                
                # SC
                sc_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("🟢 SC", "launchSC:", "")
                sc_item.setTarget_(self)
                sc_item.setRepresentedObject_(device['id'])
                device_submenu.addItem_(sc_item)
                
                # SCA
                sca_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("🟡 SCA", "launchSCA:", "")
                sca_item.setTarget_(self)
                sca_item.setRepresentedObject_(device['id'])
                device_submenu.addItem_(sca_item)
                
                # SCB
                scb_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("🔴 SCB", "launchSCB:", "")
                scb_item.setTarget_(self)
                scb_item.setRepresentedObject_(device['id'])
                device_submenu.addItem_(scb_item)
                
                # 断开连接
                disconnect_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("🔌 断开连接", "disconnectDevice:", "")
                disconnect_item.setTarget_(self)
                disconnect_item.setRepresentedObject_(device['id'])
                device_submenu.addItem_(disconnect_item)
                
                device_menu_item.setSubmenu_(device_submenu)
                self.device_menu.addItem_(device_menu_item)
    
    def cleanup_device_control_items(self):
        """清理设备控制菜单项"""
        if not hasattr(self, 'device_control_items'):
            self.device_control_items = []
            return
        
        # 从父菜单中移除这些项
        for item in self.device_control_items:
            parent_menu = item.menu()
            if parent_menu:
                parent_menu.removeItem_(item)
        
        self.device_control_items = []
    
    def launchScrcpy_(self, sender):
        """启动Scrcpy"""
        device_id = sender.representedObject()
        self.launch_scrcpy(device_id, 'scrcpy')
    
    def launchSC_(self, sender):
        """启动SC"""
        device_id = sender.representedObject()
        self.launch_scrcpy(device_id, 'sc')
    
    def launchSCA_(self, sender):
        """启动SCA"""
        device_id = sender.representedObject()
        self.launch_scrcpy(device_id, 'sca')
    
    def launchSCB_(self, sender):
        """启动SCB"""
        device_id = sender.representedObject()
        self.launch_scrcpy(device_id, 'scb')
    
    def disconnectDevice_(self, sender):
        """断开设备连接"""
        device_id = sender.representedObject()
        self.disconnect_device(device_id)
    
    def scan_devices(self):
        """扫描设备"""
        if self.scanning:
            self.show_alert("正在扫描中，请稍候...")
            return
        
        self.scanning = True
        
        # 在后台线程中执行扫描
        self.scan_thread = threading.Thread(target=self._scan_devices_background)
        self.scan_thread.daemon = True
        self.scan_thread.start()
    
    def _scan_devices_background(self):
        """后台扫描设备"""
        try:
            # 运行scan.command脚本
            scan_script = self.script_dir / 'scan.command'
            if scan_script.exists():
                result = subprocess.run(
                    [str(scan_script)],
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                
                # 扫描完成后刷新设备列表
                time.sleep(1)  # 等待设备连接稳定
                self.show_notification("扫描完成", "请刷新设备列表")
            else:
                self.show_alert("找不到scan.command脚本")
                
        except subprocess.TimeoutExpired:
            self.show_notification("扫描超时", "设备扫描超时")
        except Exception as e:
            self.show_notification("扫描错误", f"扫描过程中发生错误: {str(e)}")
        finally:
            self.scanning = False
    
    def launch_scrcpy(self, device_id, mode):
        """启动Scrcpy"""
        try:
            if mode == 'scrcpy':
                # 直接使用scrcpy命令
                subprocess.Popen(['scrcpy', '-s', device_id])
            else:
                # 使用自定义脚本（sc, sca, scb）- 需要在zsh中执行以使用别名
                # 提取IP地址（去掉端口号）
                if ':' in device_id:
                    ip_address = device_id.split(':')[0]
                else:
                    ip_address = device_id
                
                # 确保加载toolsinit.sh中的函数
                toolsinit_path = os.path.expanduser("~/sh/win-git/toolsinit.sh")
                if os.path.exists(toolsinit_path):
                    shell_command = f"source {toolsinit_path} && {mode} {ip_address}"
                else:
                    shell_command = f"source ~/.zshrc && {mode} {ip_address}"
                subprocess.Popen(['zsh', '-c', shell_command])
            
            self.show_notification("启动成功", f"正在启动 {mode} 连接到 {device_id}")
        except Exception as e:
            self.show_alert(f"启动失败: {str(e)}")
    
    def disconnect_device(self, device_id):
        """断开设备连接"""
        success, _, error = self.run_adb_command(['disconnect', device_id])
        
        if success:
            self.show_notification("断开成功", f"设备 {device_id} 已断开连接")
            self.refresh_devices()
        else:
            self.show_alert(f"断开失败: {error}")
    
    def show_settings(self):
        """显示设置"""
        alert = NSAlert.alloc().init()
        alert.setMessageText_("设置")
        alert.setInformativeText_("设置目标设备型号（包含此字符串的设备）:")
        alert.addButtonWithTitle_("确定")
        alert.addButtonWithTitle_("取消")
        
        # 创建文本输入框
        input_field = NSTextField.alloc().initWithFrame_(NSMakeRect(0, 0, 200, 24))
        input_field.setStringValue_("110")
        
        alert.setAccessoryView_(input_field)
        
        response = alert.runModal()
        
        if response == NSAlertFirstButtonReturn:
            target_device = input_field.stringValue()
            self.show_notification("设置已保存", f"目标设备型号: {target_device}")
    
    def show_history(self):
        """显示历史记录"""
        history_file = self.script_dir / 'ip.txt'
        if not history_file.exists():
            self.show_alert("暂无历史记录")
            return
        
        try:
            with open(history_file, 'r') as f:
                history = f.read().strip().split('\n')
            
            history_text = "历史连接记录:\n\n"
            for ip in history:
                if ip.strip():
                    history_text += f"• {ip.strip()}\n"
            
            self.show_alert(history_text)
        except Exception as e:
            self.show_alert(f"读取历史记录失败: {str(e)}")
    
    def start_gui_server(self):
        """启动GUI服务器"""
        gui_script = self.script_dir / 'gui-launcher.command'
        if not gui_script.exists():
            self.show_alert("找不到gui-launcher.command脚本")
            return
        
        try:
            subprocess.Popen([str(gui_script)])
            self.show_notification("服务器启动中", "GUI服务器正在启动...")
        except Exception as e:
            self.show_alert(f"启动失败: {str(e)}")
    
    def stop_gui_server(self):
        """停止GUI服务器"""
        try:
            # 查找并终止Python服务器进程
            result = subprocess.run(['pkill', '-f', 'python3 server.py'], capture_output=True)
            if result.returncode == 0:
                self.show_notification("服务器已停止", "GUI服务器已停止")
            else:
                self.show_alert("没有找到运行中的GUI服务器")
        except Exception as e:
            self.show_alert(f"停止失败: {str(e)}")
    
    def show_alert(self, message):
        """显示警告框"""
        alert = NSAlert.alloc().init()
        alert.setMessageText_(message)
        alert.addButtonWithTitle_("确定")
        alert.runModal()
    
    def show_notification(self, title, message):
        """显示通知"""
        notification = NSUserNotification.alloc().init()
        notification.setTitle_(title)
        notification.setInformativeText_(message)
        notification.setSoundName_(NSUserNotificationDefaultSoundName)
        NSUserNotificationCenter.defaultUserNotificationCenter().deliverNotification_(notification)

def main():
    """主函数"""
    # 创建应用
    app = NSApplication.sharedApplication()
    
    # 设置应用代理
    controller = ADBMenuBarController.alloc().init()
    app.setDelegate_(controller)
    
    # 运行应用
    AppHelper.runEventLoop(installInterrupt=True)

if __name__ == "__main__":
    main()