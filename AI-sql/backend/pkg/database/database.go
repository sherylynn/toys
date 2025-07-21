package database

import (
	"fmt"
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"visual-database-query-system/backend/internal/models"
)

var DB *gorm.DB

// Connect initializes the database connection and runs migrations
func Connect(dsn string) {
	var err error
	DB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Database connection established")

	// Auto-migrate the schema
	DB.AutoMigrate(&models.User{}, &models.DatabaseConnection{}, &models.QueryHistory{})
	fmt.Println("Database migrated")

	// Seed the database with demo data
	SeedDemoData()
}

// SeedDemoData populates the database with initial data for demonstration
func SeedDemoData() {
	// Check if there are any users already
	var count int64
	DB.Model(&models.User{}).Count(&count)
	if count > 0 {
		fmt.Println("Database already seeded")
		return
	}

	fmt.Println("Seeding database with demo data...")

	// Create a demo user
	adminUser := models.User{
		Username: "admin",
		Password: "admin", // In a real app, this would be a hash
		Role:     "admin",
	}
	DB.Create(&adminUser)

	// Create a demo database connection
	demoDB := models.DatabaseConnection{
		ID:       "demo_db",
		Name:     "Demo SQLite DB",
		Type:     "sqlite",
		Database: "demo_data.db",
	}
	DB.Create(&demoDB)

	// Create a separate database for demo data
	seedDemoTables(demoDB.Database)

	fmt.Println("Database seeding complete")
}

// seedDemoTables creates and populates the tables in the demo database
func seedDemoTables(dsn string) {
	demoDB, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to demo database: %v", err)
	}

	// Define some simple demo tables
	type Product struct {
		ID    uint   `gorm:"primaryKey"`
		Name  string `gorm:"not null"`
		Price float64
	}

	type Customer struct {
		ID      uint   `gorm:"primaryKey"`
		Name    string `gorm:"not null"`
		Email   string `gorm:"unique"`
	}

	type Order struct {
		ID         uint `gorm:"primaryKey"`
		CustomerID uint
		ProductID  uint
		Quantity   int
		Customer   Customer `gorm:"foreignKey:CustomerID"`
		Product    Product  `gorm:"foreignKey:ProductID"`
	}

	// Migrate the schema for the demo tables
	demoDB.AutoMigrate(&Product{}, &Customer{}, &Order{})

	// Create some demo data
	products := []Product{
		{Name: "Laptop", Price: 1200.00},
		{Name: "Mouse", Price: 25.00},
		{Name: "Keyboard", Price: 75.00},
	}
	demoDB.Create(&products)

	customers := []Customer{
		{Name: "Alice", Email: "alice@example.com"},
		{Name: "Bob", Email: "bob@example.com"},
	}
	demoDB.Create(&customers)

	orders := []Order{
		{CustomerID: 1, ProductID: 1, Quantity: 1},
		{CustomerID: 1, ProductID: 2, Quantity: 2},
		{CustomerID: 2, ProductID: 3, Quantity: 1},
	}
	demoDB.Create(&orders)
}