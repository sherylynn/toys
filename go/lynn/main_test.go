package main

import (
	"os"
	"testing"
)

// test method need upper case too
func TestUnzipTest(t *testing.T) {
	// struct test need new struct
	var l Lynn
	fileName := l.UnzipTest()
	_, err := os.Stat("zipDir")
	if err != nil && os.IsNotExist(err) {
		t.Error(err)
	} else {
		os.RemoveAll("zipDir")
		os.Remove(fileName)
	}
}
