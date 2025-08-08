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
        self.target_device_name = "110"  # 默认目标设备名
        
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
        self.device_menu_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("设备列表 (0)", None, "")
        self.device_menu_item.setEnabled_(True)  # 确保菜单项可用
        menu.addItem_(self.device_menu_item)
        
        # 设备列表子菜单
        self.device_menu = NSMenu.alloc().init()
        self.device_menu_item.setSubmenu_(self.device_menu)
        
        # 其他设备子菜单
        self.other_devices_menu = NSMenu.alloc().init()
        
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
                    
                    # 只处理在线设备，跳过offline设备
                    if status.lower() == 'device':
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
        
        try:
            # 获取设备型号
            success, model_output, error = self.run_adb_command(['-s', device_id, 'shell', 'getprop', 'ro.product.model'])
            if success and model_output.strip():
                info['model'] = model_output.strip()
            else:
                print(f"无法获取设备型号 {device_id}: {error}")
            
            # 获取设备制造商
            success, manufacturer_output, error = self.run_adb_command(['-s', device_id, 'shell', 'getprop', 'ro.product.manufacturer'])
            if success and manufacturer_output.strip():
                info['manufacturer'] = manufacturer_output.strip()
            else:
                print(f"无法获取设备制造商 {device_id}: {error}")
                
        except Exception as e:
            print(f"获取设备信息时发生异常 {device_id}: {str(e)}")
        
        return info
    
    def update_device_menu(self):
        """更新设备菜单 - 智能菜单结构"""
        # 清理之前添加的菜单项
        self.cleanup_device_control_items()
        
        # 清空设备菜单
        self.device_menu.removeAllItems()
        self.other_devices_menu.removeAllItems()
        
        if not self.devices:
            # 无设备时隐藏设备列表菜单项
            self.device_menu_item.setHidden_(True)
            return
        
        # 分离目标设备和其他设备
        target_devices = []
        other_devices = []
        
        print(f"开始分类设备，目标字符串: '{self.target_device_name}'")
        for device in self.devices:
            device_name = device['info']['model']
            device_id = device['id']
            
            # 检查设备型号或设备ID是否包含目标字符串
            is_target = False
            if self.target_device_name:
                target_lower = self.target_device_name.lower()
                if (target_lower in device_name.lower() or 
                    target_lower in device_id.lower()):
                    is_target = True
                    
            print(f"设备: {device_name} ({device_id}) - 是否目标设备: {is_target}")
            if is_target:
                target_devices.append(device)
            else:
                other_devices.append(device)
        
        print(f"分类结果 - 目标设备: {len(target_devices)}, 其他设备: {len(other_devices)}")
        
        # 获取主菜单
        main_menu = self.status_item.menu()
        device_menu_index = main_menu.indexOfItem_(self.device_menu_item)
        
        # 根据是否有目标设备决定菜单结构
        if target_devices:
            # 场景A：有目标设备时
            
            # 在主菜单中显示目标设备及其命令
            for device in target_devices:
                device_name = f"🎯 {device['info']['model']} ({device['id']})"
                device_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_(device_name, "", "")
                device_item.setEnabled_(False)  # 设备名称作为标题，不可点击，显示为灰色
                main_menu.insertItem_atIndex_(device_item, device_menu_index + len(self.device_control_items))
                self.device_control_items.append(device_item)
                
                # Scrcpy - 缩进显示
                scrcpy_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("    📱 Scrcpy", "launchScrcpy:", "")
                scrcpy_item.setTarget_(self)
                scrcpy_item.setRepresentedObject_(device['id'])
                main_menu.insertItem_atIndex_(scrcpy_item, device_menu_index + len(self.device_control_items))
                self.device_control_items.append(scrcpy_item)
                
                # SC - 缩进显示
                sc_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("    🟢 SC", "launchSC:", "")
                sc_item.setTarget_(self)
                sc_item.setRepresentedObject_(device['id'])
                main_menu.insertItem_atIndex_(sc_item, device_menu_index + len(self.device_control_items))
                self.device_control_items.append(sc_item)
                
                # SCA - 缩进显示
                sca_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("    🟡 SCA", "launchSCA:", "")
                sca_item.setTarget_(self)
                sca_item.setRepresentedObject_(device['id'])
                main_menu.insertItem_atIndex_(sca_item, device_menu_index + len(self.device_control_items))
                self.device_control_items.append(sca_item)
                
                # SCB - 缩进显示
                scb_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("    🔴 SCB", "launchSCB:", "")
                scb_item.setTarget_(self)
                scb_item.setRepresentedObject_(device['id'])
                main_menu.insertItem_atIndex_(scb_item, device_menu_index + len(self.device_control_items))
                self.device_control_items.append(scb_item)
                
                # 断开连接 - 缩进显示
                disconnect_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("    🔌 断开连接", "disconnectDevice:", "")
                disconnect_item.setTarget_(self)
                disconnect_item.setRepresentedObject_(device['id'])
                main_menu.insertItem_atIndex_(disconnect_item, device_menu_index + len(self.device_control_items))
                self.device_control_items.append(disconnect_item)
            
            # 其他设备放在子菜单
            if other_devices:
                print(f"设置其他设备菜单: {len(other_devices)} 个设备")
                self.device_menu_item.setTitle_(f"其他设备 ({len(other_devices)})")
                self.device_menu_item.setSubmenu_(self.device_menu)
                self.device_menu_item.setAction_(None)
                self.device_menu_item.setEnabled_(True)  # 确保主菜单项可用
                self.device_menu_item.setHidden_(False)
                print(f"其他设备菜单项状态 - isEnabled: {self.device_menu_item.isEnabled()}, isHidden: {self.device_menu_item.isHidden()}")
                
                # 在设备列表子菜单中显示其他设备
                for device in other_devices:
                    device_name = f"{device['info']['model']} ({device['id']})"
                    print(f"创建其他设备菜单项: {device_name}")
                    device_menu_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_(device_name, None, "")
                    device_menu_item.setEnabled_(True)  # 确保菜单项可用
                    
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
                    print(f"子菜单项已添加: {device_name}, 子菜单项数量: {device_submenu.numberOfItems()}")
                
                print(f"其他设备子菜单总项数: {self.device_menu.numberOfItems()}")
            else:
                # 没有其他设备，隐藏设备列表菜单
                self.device_menu_item.setHidden_(True)
                
        else:
            # 场景B：无目标设备时
            
            # 隐藏"其他设备"菜单项
            self.device_menu_item.setHidden_(True)
            
            # 其他设备直接在主菜单显示
            for device in other_devices:
                device_name = f"📱 {device['info']['model']} ({device['id']})"
                device_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_(device_name, "", "")
                device_item.setEnabled_(False)  # 设备名称作为标题，不可点击，显示为灰色
                main_menu.insertItem_atIndex_(device_item, device_menu_index + len(self.device_control_items))
                self.device_control_items.append(device_item)
                
                # Scrcpy - 缩进显示
                scrcpy_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("    📱 Scrcpy", "launchScrcpy:", "")
                scrcpy_item.setTarget_(self)
                scrcpy_item.setRepresentedObject_(device['id'])
                main_menu.insertItem_atIndex_(scrcpy_item, device_menu_index + len(self.device_control_items))
                self.device_control_items.append(scrcpy_item)
                
                # SC - 缩进显示
                sc_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("    🟢 SC", "launchSC:", "")
                sc_item.setTarget_(self)
                sc_item.setRepresentedObject_(device['id'])
                main_menu.insertItem_atIndex_(sc_item, device_menu_index + len(self.device_control_items))
                self.device_control_items.append(sc_item)
                
                # SCA - 缩进显示
                sca_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("    🟡 SCA", "launchSCA:", "")
                sca_item.setTarget_(self)
                sca_item.setRepresentedObject_(device['id'])
                main_menu.insertItem_atIndex_(sca_item, device_menu_index + len(self.device_control_items))
                self.device_control_items.append(sca_item)
                
                # SCB - 缩进显示
                scb_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("    🔴 SCB", "launchSCB:", "")
                scb_item.setTarget_(self)
                scb_item.setRepresentedObject_(device['id'])
                main_menu.insertItem_atIndex_(scb_item, device_menu_index + len(self.device_control_items))
                self.device_control_items.append(scb_item)
                
                # 断开连接 - 缩进显示
                disconnect_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_("    🔌 断开连接", "disconnectDevice:", "")
                disconnect_item.setTarget_(self)
                disconnect_item.setRepresentedObject_(device['id'])
                main_menu.insertItem_atIndex_(disconnect_item, device_menu_index + len(self.device_control_items))
                self.device_control_items.append(disconnect_item)
    
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
        
        # 重置设备列表菜单项的可见性和状态
        if hasattr(self, 'device_menu_item'):
            print("清理菜单项，重置状态")
            self.device_menu_item.setHidden_(False)
            self.device_menu_item.setEnabled_(True)
            self.device_menu_item.setSubmenu_(None)  # 清除之前的子菜单
            print(f"重置后菜单项状态 - isEnabled: {self.device_menu_item.isEnabled()}")
    
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
    
    def selectDevice_(self, sender):
        """选择设备（用于其他设备列表）"""
        device_id = sender.representedObject()
        # 可以在这里添加设备选择后的操作，比如显示设备信息
        self.show_notification(f"设备选择", f"已选择设备: {device_id}")
    
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
        input_field.setStringValue_(self.target_device_name)
        
        alert.setAccessoryView_(input_field)
        
        response = alert.runModal()
        
        if response == NSAlertFirstButtonReturn:
            target_device = input_field.stringValue()
            if target_device.strip():
                self.target_device_name = target_device.strip()
                self.show_notification("设置已保存", f"目标设备型号: {self.target_device_name}")
                # 刷新设备菜单显示
                self.update_device_menu()
            else:
                self.show_notification("设置错误", "目标设备名称不能为空")
    
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