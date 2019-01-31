#!/usr/bin/env python
import argparse
import getopt
import sys
import fire

def argparse_test():
    parse=argparse.ArgumentParser(description="manual to this tool")
    parse.add_argument("i",default=None)
    args=parse.parse_args()
    print(args)

def sys_argv():
    #sys.argv[x]的方式太死板，不适合后期变化和添加参数
    print(sys.argv)
def getopt_test():
    #getopt 需要前缀 - 或 -- 不满足需求
    arg=getopt.getopt(sys.argv[1:],"i:r",["install=","remove"])
    print(arg)

#强大的fire方法
def install(name,age):
    print(name)
    print(age)
if __name__=="__main__":
    fire.Fire()