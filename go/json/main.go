package main

import (
	"encoding/json"
	"fmt"
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
	packJson := `{
  "name":"v2ray",
  "version":"4.11.0",
  "url":"https://github.com/v2ray/v2ray-core/releases/download/v$version/v2ray-$os-$arch.zip",
  "extension":"zip",
  "arch":{"armv7l":"arm","armv8l":"arm","AMD64":"64","x86_64":"64"},
  "os":{"Linux":"linux","Windows":"windows","Darwin":"macos"},
  "comment":"https://github.com/v2ray/v2ray-core/releases/download/v4.11.0/v2ray-linux-arm.zip"
	}`
	var pack Pack
	json.Unmarshal([]byte(packJson), &pack)
	fmt.Println(pack)
	fmt.Println(pack.Arch["x86_64"])
	fmt.Println(pack.Os.Darwin)
}
