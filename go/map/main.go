package main

import (
	"fmt"
	//"strconv"
	jsoniter "github.com/json-iterator/go"
)

func main() {
	str := `{"test":1}`
	pageNum := jsoniter.Get([]byte(str)).ToString()
	fmt.Println(pageNum)
	json := jsoniter.ConfigCompatibleWithStandardLibrary

	//bookMap := make(map[string]interface{})
	//bookMap := make(map[string]string)
	bookMap := make(map[string]int)
	json.Unmarshal([]byte(str), &bookMap)
	fmt.Println(bookMap)
	bookMap["fuck"] = 2
	fmt.Println(bookMap)
	jsonStr, err := json.Marshal(bookMap)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Printf("%s", jsonStr)
	fmt.Println(bookMap["test"])
	fmt.Println(bookMap["noValue"])
	/*
		if bookMap["noValue"] == nil {
			fmt.Println("empty and nil")
		}
		if bookMap["noValue"] == "" {
			fmt.Println("empty and ''")
		}
	*/
	if bookMap["noValue"] == 0 {
		fmt.Println("empty and 0")
	}
	//fmt.Println(nil.ToString())
	//fmt.Println(strconv.ParseInt(bookMap["test"].ToString()))
}
