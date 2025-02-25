import time
import sys
import subprocess
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import psutil

class ServerRestartHandler(FileSystemEventHandler):
    def __init__(self, server_process=None):
        self.server_process = server_process
        self.restart_pending = False
        self.last_restart = 0
        self.cooldown = 2  # 冷却时间（秒）

    def restart_server(self):
        current_time = time.time()
        if current_time - self.last_restart < self.cooldown:
            if not self.restart_pending:
                self.restart_pending = True
            return

        print("\n检测到文件变化，正在重启服务器...")
        
        # 终止现有服务器进程及其子进程
        if self.server_process:
            try:
                parent = psutil.Process(self.server_process.pid)
                children = parent.children(recursive=True)
                for child in children:
                    child.terminate()
                parent.terminate()
                self.server_process.terminate()
            except (psutil.NoSuchProcess, ProcessLookupError):
                pass

        # 启动新的服务器进程
        self.server_process = subprocess.Popen([sys.executable, 'server.py'])
        print("服务器已重启！")
        
        self.last_restart = current_time
        self.restart_pending = False

    def on_modified(self, event):
        if event.src_path.endswith('.py') and not event.src_path.endswith('watch_server.py'):
            self.restart_server()

def start_file_monitor():
    # 启动初始服务器进程
    server_process = subprocess.Popen([sys.executable, 'server.py'])
    print("服务器已启动！")

    # 创建事件处理器和观察者
    event_handler = ServerRestartHandler(server_process)
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
            if event_handler.restart_pending:
                event_handler.restart_server()
    except KeyboardInterrupt:
        observer.stop()
        if server_process:
            server_process.terminate()
        print("\n服务器已停止！")
    observer.join()

if __name__ == '__main__':
    start_file_monitor()

    # 设置文件监控
    event_handler = ServerRestartHandler(server_process)
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
            # 检查是否需要重启
            if event_handler.restart_pending:
                event_handler.restart_server()
    except KeyboardInterrupt:
        observer.stop()
        if server_process:
            server_process.terminate()
        print("\n服务器监控已停止！")
    
    observer.join()

if __name__ == "__main__":
    start_file_monitor()