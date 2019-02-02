package main

import (
	//"encoding/json"
	"fmt"
	"github.com/corona10/fuego"
)

func install() {
	fmt.Print("help")
}

func main() {
	fuego.Fire(install)
}
