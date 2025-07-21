package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"visual-database-query-system/backend/internal/models"
	"visual-database-query-system/backend/internal/services"
	"visual-database-query-system/backend/pkg/database"
)

var excelService = services.NewExcelService()

// BuildQuery handles building and executing a query
func BuildQuery(c *gin.Context) {
	var req models.QueryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Get the database connection
	var dbConn models.DatabaseConnection
	if err := database.DB.First(&dbConn, "id = ?", req.DatabaseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Database not found"})
		return
	}

	db, err := connManager.GetConnection(&dbConn)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}

	// Build the SQL query
	qb := services.NewQueryBuilder(&req)
	sql, args := qb.BuildSQL()

	// Execute the query
	rows, err := db.Raw(sql, args...).Rows()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to execute query"})
		return
	}
	defer rows.Close()

	// Get the column names
	columns, err := rows.Columns()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get columns"})
		return
	}

	// Scan the results into a slice of maps
	results := scanResults(rows, columns)

	c.JSON(http.StatusOK, gin.H{
		"sql":     sql,
		"columns": columns,
		"data":    results,
	})
}

// ExportQuery handles exporting a query to Excel
func ExportQuery(c *gin.Context) {
	var req models.QueryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Get the database connection
	var dbConn models.DatabaseConnection
	if err := database.DB.First(&dbConn, "id = ?", req.DatabaseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Database not found"})
		return
	}

	db, err := connManager.GetConnection(&dbConn)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}

	// Build the SQL query
	qb := services.NewQueryBuilder(&req)
	sql, args := qb.BuildSQL()

	// Execute the query
	rows, err := db.Raw(sql, args...).Rows()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to execute query"})
		return
	}
	defer rows.Close()

	// Get the column names
	columns, err := rows.Columns()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get columns"})
		return
	}

	// Scan the results
	results := scanResults(rows, columns)

	// Generate the Excel file
	buf, err := excelService.GenerateExcelFile(columns, results)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate Excel file"})
		return
	}

	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", "attachment; filename=query_results.xlsx")
	c.Data(http.StatusOK, "application/octet-stream", buf.Bytes())
}

// scanResults scans the rows from the database into a slice of maps
func scanResults(rows *sql.Rows, columns []string) []map[string]interface{} {
	var results []map[string]interface{}
	for rows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range columns {
			valuePtrs[i] = &values[i]
		}

		rows.Scan(valuePtrs...)

		rowData := make(map[string]interface{})
		for i, col := range columns {
			val := values[i]
			rowData[col] = val
		}
		results = append(results, rowData)
	}
	return results
}

// GetQueryHistory returns a list of query history for the current user
func GetQueryHistory(c *gin.Context) {
	// TODO: Get UserID from JWT claims
	userID := uint(1) // Placeholder for now

	var history []models.QueryHistory
	if err := database.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve query history"})
		return
	}

	c.JSON(http.StatusOK, history)
}
