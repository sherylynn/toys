package services

import (
	"bytes"
	"fmt"

	"github.com/xuri/excelize/v2"
)

// ExcelService handles Excel file generation
type ExcelService struct{}

// NewExcelService creates a new ExcelService
func NewExcelService() *ExcelService {
	return &ExcelService{}
}

// GenerateExcelFile generates an Excel file from the given data
func (s *ExcelService) GenerateExcelFile(columns []string, data []map[string]interface{}) (*bytes.Buffer, error) {
	f := excelize.NewFile()
	streamWriter, err := f.NewStreamWriter("Sheet1")
	if err != nil {
		return nil, err
	}

	// Write the header row
	header := make([]interface{}, len(columns))
	for i, col := range columns {
		header[i] = col
	}
	if err := streamWriter.SetRow("A1", header); err != nil {
		return nil, err
	}

	// Write the data rows
	for i, rowData := range data {
		row := make([]interface{}, len(columns))
		for j, col := range columns {
			row[j] = rowData[col]
		}
		if err := streamWriter.SetRow(fmt.Sprintf("A%d", i+2), row); err != nil {
			return nil, err
		}
	}

	if err := streamWriter.Flush(); err != nil {
		return nil, err
	}

	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}

	return buf, nil
}
