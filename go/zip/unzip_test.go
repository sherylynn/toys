package zip

import (
	"os"
	"testing"
)

func TestUnzipWithOutArgs(t *testing.T) {
	Unzip("test.zip")
	_, err := os.Stat("zipDir")
	if err != nil && os.IsNotExist(err) {
		t.Error(err)
	} else {
		os.RemoveAll("zipDir")
	}
}
func TestUnzipWithArgs(t *testing.T) {
	Unzip("test.zip", "./")
	_, err := os.Stat("zipDir/zipFile.txt")
	if err != nil && os.IsNotExist(err) {
		t.Error(err)
	} else {
		os.RemoveAll("zipDir")
	}
}
