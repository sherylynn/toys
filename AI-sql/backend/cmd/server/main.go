package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"visual-database-query-system/backend/internal/config"
	"visual-database-query-system/backend/internal/handlers"
	"visual-database-query-system/backend/internal/middleware"
	"visual-database-query-system/backend/pkg/database"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to the database
	database.Connect(cfg.DB_DSN)

	// Set up the Gin router
	r := gin.Default()

	// Public routes
	authRoutes := r.Group("/api/auth")
	{
		authRoutes.POST("/login", handlers.Login)
		authRoutes.POST("/register", handlers.Register) // This should be protected
	}

	// Protected routes
	apiRoutes := r.Group("/api")
	apiRoutes.Use(middleware.AuthMiddleware())
	{
		apiRoutes.GET("/protected", func(c *gin.Context) {
			username, _ := c.Get("username")
			c.JSON(200, gin.H{"message": "Hello, " + username.(string)})
		})

		// Database metadata routes
		dbRoutes := apiRoutes.Group("/databases")
		{
			dbRoutes.GET("", handlers.GetDatabases)
			dbRoutes.GET("/:id/tables", handlers.GetDatabaseTables)
		}

		// Query routes
		queryRoutes := apiRoutes.Group("/query")
		{
			queryRoutes.POST("/build", handlers.BuildQuery)
			queryRoutes.POST("/export", handlers.ExportQuery)
			queryRoutes.GET("/history", handlers.GetQueryHistory)
		}

		// User management routes (admin only)
		userRoutes := apiRoutes.Group("/users")
		{
			userRoutes.GET("", handlers.GetUsers)
		}
	}

	// Simple health check endpoint
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// Start the server
	log.Printf("Server starting on port %s", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
