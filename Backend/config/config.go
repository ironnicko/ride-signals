package config

import (
	"os"
)

type Config struct {
	MongoURI     string
	KafkaBrokers string
	JWTSecret    string
	Mode   string
	ServerPort   string
}

func LoadConfig() *Config {
	return &Config{
		MongoURI:     getEnv("MONGO_URI", "mongodb://localhost:27017"),
		KafkaBrokers: getEnv("KAFKA_BROKERS", "localhost:9092"),
		JWTSecret:    getEnv("JWT_SECRET", "supersecret"),
		ServerPort:   getEnv("PORT", "8080"),
		Mode:   getEnv("MODE", "local"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
