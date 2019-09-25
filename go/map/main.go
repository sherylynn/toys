package main

import (
	"fmt"

	jsoniter "github.com/json-iterator/go"
)

func main() {
	str := `{"test":1}`
	pageNum := jsoniter.Get([]byte(str)).ToString()
	fmt.Println(pageNum)
	json := jsoniter.ConfigCompatibleWithStandardLibrary

	bookMap := make(map[string]interface{})
	json.Unmarshal([]byte(str), &bookMap)
	fmt.Println(bookMap)
	bookMap["fuck"] = 2
	fmt.Println(bookMap)
	jsonStr, err := json.Marshal(bookMap)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Printf("%s", jsonStr)
}
