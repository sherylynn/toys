package wget

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

func GetFileName(URL string) string {
	fileName := strings.Split(URL, "/")
	return fileName[len(fileName)-1]
}
func Get(URL string) string {
	fileName := GetFileName(URL)
	out, err := os.Create(fileName)
	if err != nil {
		log.Fatal(err)
	}
	defer out.Close()
	res, err := http.Get(URL)
	if err != nil {
		log.Fatal(err)
	}
	defer res.Body.Close()
	size, err := io.Copy(out, res.Body)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("finished,size:", size)
	return fileName
}
