package main

import (
	"fmt"
	"github.com/sherylynn/toys/go/zip"
)

func main() {
	fmt.Println("hello 世界")
	zip.Unzip("test.zip", "./")
	//zip.Unzip("~/toys/go/zip/test.zip", "~/toys/go/zip")
}
