package utils

import (
	"log"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/ironnicko/tandem-sync/SocketServer/config"
	"github.com/ironnicko/tandem-sync/SocketServer/types"
)

func IsValidToken(authHeader string) (string, bool) {
	cfg := config.Envs
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims := &types.JwtPayload{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(cfg.JWTSECRET), nil
	})
	if err != nil || !token.Valid || claims.UserID == "" {
		log.Println("JWT verification failed:", err)
		return "", false
	}
	return claims.UserID, true
}

func BroadcastToRoom(rideCode string, message any) {
	config.RoomsMu.Lock()
	defer config.RoomsMu.Unlock()
	for conn := range config.RideRooms[rideCode] {
		conn.WriteJSON(message)
	}
}

func CleanupConnection(conn *websocket.Conn) {
	userID := config.ActiveUsers[conn]
	delete(config.ActiveUsers, conn)

	config.RoomsMu.Lock()
	defer config.RoomsMu.Unlock()
	for rideCode, members := range config.RideRooms {
		if _, ok := members[conn]; ok {
			delete(members, conn)
			BroadcastToRoom(rideCode, map[string]any{
				"eventType": "userLeft",
				"data":      map[string]string{"userId": userID},
			})
		}
	}
	conn.Close()
}
