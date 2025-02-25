#!/usr/bin/env python3

import subprocess
import sys
import os
import signal
import time

def start_frontend():
    """启动前端服务"""
    try:
        # 使用npm run dev启动前端服务
        frontend_process = subprocess.Popen(
            ['npm', 'run', 'dev'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        return frontend_process
    except Exception as e:
        print(f'启动前端服务失败: {str(e)}')
        return None

def start_backend():
    """启动后端服务"""
    try:
        # 使用python server.py启动后端服务
        backend_process = subprocess.Popen(
            [sys.executable, 'server.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True,
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        
        # 立即检查进程是否启动成功
        time.sleep(1)
        if backend_process.poll() is not None:
            # 获取错误输出
            _, stderr = backend_process.communicate()
            print(f'后端服务启动失败，错误信息：\n{stderr}')
            return None
            
        return backend_process
    except Exception as e:
        print(f'启动后端服务失败: {str(e)}')
        return None

def monitor_output(process, service_name):
    """监控并打印服务输出"""
    while True:
        output = process.stdout.readline()
        if output:
            print(f'[{service_name}] {output.strip()}')
        if process.poll() is not None:
            break

def stop_services(frontend_process, backend_process):
    """停止所有服务"""
    processes = [(frontend_process, '前端'), (backend_process, '后端')]
    
    for process, name in processes:
        if process and process.poll() is None:
            print(f'正在停止{name}服务...')
            if sys.platform == 'win32':
                process.terminate()
            else:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print(f'{name}服务未能正常停止，强制终止...')
                if sys.platform == 'win32':
                    process.kill()
                else:
                    os.killpg(os.getpgid(process.pid), signal.SIGKILL)

def main():
    print('正在启动服务...')
    
    # 启动前端服务
    frontend_process = start_frontend()
    if not frontend_process:
        print('前端服务启动失败')
        return
    
    # 启动后端服务
    backend_process = start_backend()
    if not backend_process:
        print('后端服务启动失败')
        stop_services(frontend_process, None)
        return
    
    print('所有服务已启动')
    print('按Ctrl+C停止所有服务')
    
    try:
        # 监控服务输出
        from threading import Thread
        frontend_thread = Thread(target=monitor_output, args=(frontend_process, '前端'))
        backend_thread = Thread(target=monitor_output, args=(backend_process, '后端'))
        
        frontend_thread.daemon = True
        backend_thread.daemon = True
        
        frontend_thread.start()
        backend_thread.start()
        
        # 等待服务运行
        while True:
            if frontend_process.poll() is not None:
                print('前端服务已停止')
                break
            if backend_process.poll() is not None:
                print('后端服务已停止')
                break
            time.sleep(1)
            
    except KeyboardInterrupt:
        print('\n接收到停止信号')
    finally:
        stop_services(frontend_process, backend_process)
        print('所有服务已停止')

if __name__ == '__main__':
    main()