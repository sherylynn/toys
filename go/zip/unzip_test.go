package zip

import (
	"os"
	"testing"
)

func Test(t *testing.T) {
	Unzip("test.zip", "./")
	_, err := os.Stat("zipDir")
	if err != nil && os.IsNotExist(err) {
		t.Error(err)
	} else {
		os.RemoveAll("zipDir")
	}
}
