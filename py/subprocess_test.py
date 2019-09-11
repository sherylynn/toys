import subprocess
p = subprocess.Popen('ping www.baidu.com',shell=True,stdout=subprocess.PIPE)
while 1:
    line=p.stdout.readline()
    if "time" in line:
        print(line)
        break

#是否是shell不影响jupyter依然会把输出跑到终端
#q = subprocess.Popen('jupyter notebook --port=8887',shell=True,stdout=subprocess.PIPE)
q = subprocess.Popen(['jupyter','notebook','--port=8887'],stdout=subprocess.PIPE)
while 1:
    line2=q.stdout.readline()
    if "http" in line2:
        print(line2)
        break