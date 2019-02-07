package main

import (
	"fmt"

	"github.com/sherylynn/fuego"
)

type Lynn struct {
	help string
}

func (l Lynn) Echo(a string) {
	fmt.Println(l.help + " " + a)
}
func main() {
	var l Lynn
	l.help = "help"
	fuego.Fire(l)
}
