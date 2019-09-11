import subprocess
p = subprocess.Popen('ping www.baidu.com',shell=True,stdout=subprocess.PIPE)
while 1:
    line=p.stdout.readline().decode('utf-8')
    if 'time' in line:
        print(line)
        break

#是否是shell不影响jupyter依然会把输出跑到终端
#发现用的是stderr
#q = subprocess.Popen('jupyter notebook --port=8887',shell=True,stdout=subprocess.PIPE)
q = subprocess.Popen(['jupyter','notebook','--port=8887'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
while 1:
    line2=q.stderr.readline().decode('utf-8')
    if "http" in line2:
        print(line2)
        url=line2.split(" ")[-1]
        subprocess.call(['termux-open-url',url])
        break
