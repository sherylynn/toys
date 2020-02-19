package main

import (
	"fmt"
  "os/exec"
)

func main(){
  output,err:=exec.Command("node","./../../js/golang.js").Output()
  if err!=nil{
fmt.Println(err)
  }
  fmt.Println(string(output))
}
