time_count=0
time_space=90
block_title="微信firefox"
allow_title="通关宝典考试软件选择命令提示符"
alert_message="还在玩,快学习,快起床,快想想你要开玛莎拉蒂,"
#pip3 install pynput

from pynput import mouse
from datetime import datetime
from threading import Timer

#pip3 install pywin32
import win32api
import win32con
import win32gui as w
from datetime import date,timedelta

import pyttsx3 
# 模块初始化


def remain_daytime():
    d1=date(2021, 8, 27)
    d2=date.today()
    return (d1-d2).days


def alert():
    #win32api.MessageBox(None,"快去看书","要命啦!!!!!!!!!!!!!!!!!!!!!",win32con.MB_OK)
    engine = pyttsx3.init() 
    # 设置要播报的Unicode字符串
    engine.say(alert_message+"离考试倒数天数只有%d天了"%remain_daytime()) 
    # 等待语音播报完毕 
    engine.runAndWait()


# 打印时间函数
def countTime(inc):
    global time_count
    global time_space
    time_count+=1
    print(time_count)
    if time_count >= time_space:
        alert()
    t = Timer(inc, countTime, (inc,))
    t.start()

#循环1s计时
countTime(1)

def clear_time_count():
    global block_title
    global time_count
    title = w.GetWindowText (w.GetForegroundWindow())
    #如果不是被禁止的窗口,点击鼠标会清空
    #if title not in block_title:
    #    time_count=0
    if title !="" and title in allow_title:
        time_count=0

def on_move(x, y):
    clear_time_count()

def on_click(x, y, button, pressed):
    clear_time_count()

def on_scroll(x, y, dx, dy):
    clear_time_count()

# Collect events until released
with mouse.Listener(
        on_move=on_move,
        on_click=on_click,
        on_scroll=on_scroll) as listener:
    listener.join()

# ...or, in a non-blocking fashion:
listener = mouse.Listener(
    on_move=on_move,
    on_click=on_click,
    on_scroll=on_scroll)
listener.start()