package main

import (
	"fmt"
	"github.com/sherylynn/fuego"
	"github.com/sherylynn/toys/go/zip"
)

type Lynn struct {
	help string
}

func (l Lynn) UnzipTest() {
	zip.Unzip("~/toys/go/zip/test.zip", "~/toys/go/zip")
}

func (l Lynn) Echo(a string) {
	fmt.Println(l.help + " " + a)
}
func main() {
	var l Lynn
	l.help = "help"
	fuego.Fire(l)
}
