package services

import (
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"visual-database-query-system/backend/internal/models"
)

// ConnectionManager manages database connections
type ConnectionManager struct {
	connections map[string]*gorm.DB
}

// NewConnectionManager creates a new ConnectionManager
func NewConnectionManager() *ConnectionManager {
	return &ConnectionManager{
		connections: make(map[string]*gorm.DB),
	}
}

// GetConnection returns a database connection for the given config
func (cm *ConnectionManager) GetConnection(conn *models.DatabaseConnection) (*gorm.DB, error) {
	if db, ok := cm.connections[conn.ID]; ok {
		return db, nil
	}

	var dsn string
	var dialector gorm.Dialector

	switch conn.Type {
	case "sqlite":
		dialector = sqlite.Open(conn.Database)
	case "mysql":
		dsn = fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			conn.Username, conn.Password, conn.Host, conn.Port, conn.Database)
		dialector = mysql.Open(dsn)
	case "postgres":
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable",
			conn.Host, conn.Username, conn.Password, conn.Database, conn.Port)
		dialector = postgres.Open(dsn)
	default:
		return nil, fmt.Errorf("unsupported database type: %s", conn.Type)
	}

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		return nil, err
	}

	cm.connections[conn.ID] = db
	return db, nil
}
