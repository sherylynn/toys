#!/usr/bin/env python3
import json
import os
import shutil
from os import path
import platform
import zipfile
import tarfile
from pathlib import Path
import fire
import requests
class lynn:
    def __init__(self):
        # info
        self.arch=platform.machine()
        self.os=platform.system()
        self.home=str(Path.home())
        # dir
        self.install_dirname="tools"
        self.cache_dirname="caches"
        self.install_path=path.join(self.home,self.install_dirname)
        self.cache_path=path.join(self.install_path,self.cache_dirname)
        # mkdir
        if not path.exists(self.install_path):
            os.mkdir(self.install_path)
        if not path.exists(self.cache_path):
            os.mkdir(self.cache_path)
        #os.chdir(self.home)

    def install(self,pack,version="default"):
        self.packName=pack
        self.packJson=self.loadJson(pack)
        if version!="default":
            self.packVersion=version
        else:
            self.packVersion=self.packJson["version"]
        url_fix_version=self.packJson["url"].replace("$version",self.packVersion)
        url_fix_arch=url_fix_version.replace("$arch",self.packJson["arch"][self.arch])
        url_fix_os=url_fix_arch.replace("$os",self.packJson["os"][self.os])
        self.url=url_fix_os
        self.packFileName=pack+self.arch+self.packVersion+"."+self.packJson["extension"]
        self.cd_install_dir()
        if not self.checkCache(self.packFileName):
            self.download(self.url,self.packFileName)
        self.unpack(self.packFileName)

    def checkCache(self,packFileName):
        if os.path.exists(path.join(self.cache_path,packFileName)):
            print("已经缓存")
            return True
        else:
            return False


    def download(self,url,packFileName):
        r=requests.get(url)
        with open(path.join(self.cache_path,packFileName),"wb") as package:
            package.write(r.content)

    def loadJson(self,pack):
        with open(path.dirname(__file__)+"/../../json/"+pack+".json") as jsonFile:
            packJson=json.loads(jsonFile.read())
            return packJson

    def unpack(self,packFileName):
        self.cd_cache_dir()
        if zipfile.is_zipfile(self.packFileName):
            with zipfile.ZipFile(self.packFileName) as zipPack:
                zipPack.extractall(path.join(self.install_path,self.packName))
        elif tarfile.is_tarfile(self.packFileName):
            with tarfile.TarFile(self.packFileName) as tarPack:
                tarPack.extractall(path.join(self.install_path,self.packName))
        self.cd_install_dir()
        #shutil.move(src dir)
    def cd_cache_dir(self):
        os.chdir(self.cache_path)
    def cd_install_dir(self):
        if not os.path.exists(self.install_path):
            os.mkdir(self.install_path)
        os.chdir(self.install_path)

    def help(self):
        print('''
Usage:
    lynn <command> [options]
    Commands:
    install                     Install packages.
    ''')
    #loadJson(sys.argv[1])

if __name__=="__main__":
    fire.Fire(lynn)
