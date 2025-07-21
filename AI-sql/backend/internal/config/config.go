package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds the application configuration
// For simplicity, we'll use environment variables
// A more robust solution would use a config file (e.g., YAML)

type Config struct {
	ServerPort string
	DB_DSN     string
}

// Load loads the configuration from environment variables
func Load() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cfg := &Config{
		ServerPort: getEnv("SERVER_PORT", "8080"),
		DB_DSN:     getEnv("DB_DSN", "user.db"),
	}

	return cfg, nil
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
