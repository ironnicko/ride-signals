package config

import (
	"os"
)

type Config struct {
	MongoURI             string
	KafkaBrokers         string
	JWTSecret            string
	RefreshJWTSecret     string
	Google_Client_ID     string
	Google_Client_Secret string
	Google_Redirect_URL  string
	Mode                 string
	ServerPort           string
}

func LoadConfig() *Config {
	return &Config{
		MongoURI:             getEnv("MONGO_URI", "mongodb://localhost:27017"),
		KafkaBrokers:         getEnv("KAFKA_BROKERS", "localhost:9092"),
		JWTSecret:            getEnv("JWT_SECRET", "supersecret"),
		RefreshJWTSecret:     getEnv("REFRESH_SECRET", "refreshsupersecret"),
		Google_Client_ID:     getEnv("GOOGLE_CLIENT_ID", ""),
		Google_Client_Secret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		Google_Redirect_URL:  getEnv("GOOGLE_REDIRECT_URL", ""),
		ServerPort:           getEnv("PORT", "8080"),
		Mode:                 getEnv("MODE", "local"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
