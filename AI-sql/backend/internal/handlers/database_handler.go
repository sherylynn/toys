package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"visual-database-query-system/backend/internal/models"
	"visual-database-query-system/backend/internal/services"
	"visual-database-query-system/backend/pkg/database"
)

var connManager = services.NewConnectionManager()

// GetDatabases returns a list of all configured databases
func GetDatabases(c *gin.Context) {
	var databases []models.DatabaseConnection
	if err := database.DB.Find(&databases).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve databases"})
		return
	}

	c.JSON(http.StatusOK, databases)
}

// GetDatabaseTables returns a list of tables for a given database
func GetDatabaseTables(c *gin.Context) {
	databaseID := c.Param("id")

	var dbConn models.DatabaseConnection
	if err := database.DB.First(&dbConn, "id = ?", databaseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Database not found"})
		return
	}

	db, err := connManager.GetConnection(&dbConn)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}

	tables, err := db.Migrator().GetTables()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tables"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"database_id": databaseID, "tables": tables})
}
