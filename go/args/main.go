package main

import (
	"fmt"
	"os"
	"runtime"
)

func main() {
	var s, sep string
	for i := 1; i < len(os.Args); i++ {
		s += sep + os.Args[i]
		sep = " "
	}
	fmt.Println(s)
	fmt.Println(os.Args[0])
	if len(os.Args) > 2 {
		fmt.Println(os.Args[1])
	}
	switch system := runtime.GOOS; system {
	case "linux":
		fmt.Println("linux")
	case "darwin":
		fmt.Println("osx")
	case "windows":
		fmt.Println("windows")
	default:
		fmt.Printf("system is %s\n", system)
	}
	fmt.Println(runtime.GOARCH)
}
