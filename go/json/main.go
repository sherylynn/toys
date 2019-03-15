package main

import (
	"encoding/json"
	"fmt"
  "io/ioutil"
)

type Pack struct {
	Name      string
	Version   string
	Url       string
	Extension string
	/*
		Arch      struct {
			Arm    string
			Armv7l string
			Armv8l string
			Amd64  string
			I386   string
			X86_64 string
		}*/
	Arch map[string]string
	Os   struct {
		Linux   string
		Windows string
		Darwin  string
	}
}

func main() {
  packJsonFile,err:= ioutil.ReadFile("../../json/v2ray.json")
  if err!=nil{
    fmt.Println(err)
  }
  packJson:=string(packJsonFile)
	var pack Pack
	json.Unmarshal([]byte(packJson), &pack)
	fmt.Println(pack)
	fmt.Println(pack.Arch["x86_64"])
	fmt.Println(pack.Os.Darwin)
}
