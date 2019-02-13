package wget

import (
	"os"
	"testing"
)

func TestGetFileName(t *testing.T) {
	if GetFileName("https://test.com/test") != "test" {
		t.Fatal("not implemented get")
	}
}
func TestGet(t *testing.T) {
	URL := "https://github.com/sherylynn/toys/raw/master/go/zip/test.zip"
	fileName := Get(URL)
	_, err := os.Stat(fileName)
	if err != nil && os.IsNotExist(err) {
		t.Error(err)
	} else {
		os.Remove(fileName)
	}
}
