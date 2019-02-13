package zip

import (
	"archive/zip"
	"io"
	"log"
	"os"
	"path/filepath"
)

func Unzip(src string, targets ...string) {
	//src and target can't parser ~ or $HOME
	target := "./"
	if len(targets) > 0 {
		target = targets[0]
	}
	zipReader, _ := zip.OpenReader(src)
	for _, file := range zipReader.Reader.File {
		zippedFile, err := file.Open()
		if err != nil {
			log.Fatal(err)
		}
		defer zippedFile.Close()

		extractedFilePath := filepath.Join(target, file.Name)
		if file.FileInfo().IsDir() {
			os.MkdirAll(extractedFilePath, file.Mode())
		} else {
			outputFile, err := os.OpenFile(
				extractedFilePath,
				os.O_WRONLY|os.O_CREATE|os.O_TRUNC,
				file.Mode(),
			)
			if err != nil {
				log.Fatal(err)
			}
			defer outputFile.Close()
			_, err = io.Copy(outputFile, zippedFile)
			if err != nil {
				log.Fatal(err)
			}
		}
	}
}
