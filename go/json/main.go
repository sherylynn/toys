package main

import (
	"encoding/json"
	"fmt"

	"github.com/sherylynn/fuego"
)

func install() {
	fmt.Print("help")
}

func main() {
	fuego.Fire(install)
}
