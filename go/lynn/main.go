package main

import (
	"fmt"
	"github.com/sherylynn/fuego"
	"github.com/sherylynn/toys/go/wget"
	"github.com/sherylynn/toys/go/zip"
)

type Lynn struct {
	help string
}

func (l Lynn) UnzipTest() string {
	//need full https://
	URL := "https://github.com/sherylynn/toys/raw/master/go/zip/test.zip"
	//errorURL := "https://github.com/sherylynn/toys/go/zip/test.zip"
	//地址错误后依然会下到zip,但是这里后续就无法解压，需要在zip中多加一个判断zip地址的
	fileName := wget.Get(URL)
	zip.Unzip(fileName)
	return fileName
	//zip解压出来不一定有一个确切的文件夹，还是返回一个list包含所有文件？还是其他方式？
}

func (l Lynn) Echo(a string) {
	fmt.Println(l.help + " " + a)
}
func main() {
	var l Lynn
	l.help = "help"
	fuego.Fire(l)
}
