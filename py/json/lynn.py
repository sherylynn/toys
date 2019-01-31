#!/usr/bin/env python
import json
import os
from os import path
import platform
import zipfile
import tarfile
from pathlib import Path
import fire
import requests
class lynn:
    def __init__(self):
        self.arch=platform.machine()
        self.os=platform.system()
        self.home=Path.home()
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
        self.packFileName=pack+self.packVersion+"."+self.packJson["extension"]
        os.chdir(self.home)
        self.download(self.url,self.packFileName)
        self.unpack(self.packFileName)

    def download(self,url,packFileName):
        r=requests.get(url)
        with open(packFileName,"wb") as package:
            package.write(r.content)

    def loadJson(self,pack):
        with open(path.dirname(__file__)+"/../../json/"+pack+".json") as jsonFile:
            packJson=json.loads(jsonFile.read())
            return packJson

    def unpack(self,packFileName):
        if zipfile.is_zipfile(self.packFileName):
            with zipfile.ZipFile(self.packFileName) as zipPack:
                zipPack.extractall(self.packName)
        elif tarfile.is_tarfile(self.packFileName):
            with tarfile.TarFile(self.packFileName) as tarPack:
                tarPack.extractall(self.packName)

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