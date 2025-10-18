package config

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/websocket"

	"github.com/redis/go-redis/v9"
)

var (
	CTX         context.Context
	Upgrader    = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
	RedisClient *redis.Client

	RideRooms   = make(map[string]map[*websocket.Conn]string)
	RoomsMu     sync.Mutex
	ActiveUsers = make(map[*websocket.Conn]string)
	Envs        *Config
)

type Config struct {
	JWTSECRET     string
	REDISHOST     string
	REDISPORT     string
	REDISUSERNAME string
	REDISPASSWORD string
	MODE          string
	SOCKETPORT    string
}

func LoadConfig() {
	Envs = &Config{
		JWTSECRET:     getEnv("JWT_SECRET", "supersecret"),
		REDISHOST:     getEnv("REDIS_HOST", "redis"),
		REDISPORT:     getEnv("REDIS_PORT", "6379"),
		REDISUSERNAME: getEnv("REDIS_USERNAME", ""),
		REDISPASSWORD: getEnv("REDIS_PASSWORD", ""),
		MODE:          getEnv("MODE", "local"),
		SOCKETPORT:    getEnv("SOCKET_PORT", "3001"),
	}
}

func LoadGlobals() {
	CTX = context.Background()
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", Envs.REDISHOST, Envs.REDISPORT),
		Username: Envs.REDISUSERNAME,
		Password: Envs.REDISPASSWORD,
	})

}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
