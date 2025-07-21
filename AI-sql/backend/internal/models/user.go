package models

import "time"

// User represents a user in the system
type User struct {
	ID        uint      `gorm:"primaryKey"`
	Username  string    `gorm:"unique;not null"`
	Password  string    `gorm:"not null"` // Should be a bcrypt hash
	Role      string    `gorm:"not null;default:'user'"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// DatabaseConnection represents a configured database connection
type DatabaseConnection struct {
	ID        string `gorm:"primaryKey"`
	Name      string `gorm:"not null"`
	Type      string `gorm:"not null"` // "sqlite", "mysql", "postgres"
	Host      string
	Port      int
	Database  string
	Username  string
	Password  string `gorm:"-"` // Not stored in the database, configured at runtime
	CreatedAt time.Time
}

// QueryHistory represents a saved query
type QueryHistory struct {
	ID         uint      `gorm:"primaryKey"`
	UserID     uint      `gorm:"not null"`
	DatabaseID string    `gorm:"not null"`
	QueryJSON  string    `gorm:"type:text"` // JSON representation of the query
	SQL        string    `gorm:"type:text"`
	CreatedAt  time.Time
	User       User `gorm:"foreignKey:UserID"`
}