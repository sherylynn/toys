# termux 里会找不到 espeak
import pyttsx3 
# 模块初始化
engine = pyttsx3.init() 
print('准备开始语音播报...')
# 设置要播报的Unicode字符串
engine.say("你们好，哈哈哈哈") 
engine.say("上行列车接近")
engine.say("wait,,,,")
engine.say("下行列车接近")
# 等待语音播报完毕 
engine.runAndWait()