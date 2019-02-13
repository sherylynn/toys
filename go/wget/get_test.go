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
	URL := "https://github.com/sherylynn/pdf-sync/raw/master/icon.png"
	fileName := GetFileName(URL)
	Get(URL)
	_, err := os.Stat(fileName)
	if err != nil && os.IsNotExist(err) {
		t.Error(err)
	} else {
		os.Remove(fileName)
	}
}
