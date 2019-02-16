package main

import (
	"fmt"
	"log"
	"net/http"
	//"github.com/sherylynn/toys/go/zip"
)

func HelloWorld(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "hello world")
}
func main() {
	fmt.Println("hello 世界")
	//zip.Unzip("test.zip", "./")
	//zip.Unzip("~/toys/go/zip/test.zip", "~/toys/go/zip")
	http.HandleFunc("/", HelloWorld)
	log.Fatal(http.ListenAndServe(":80", nil))
}
