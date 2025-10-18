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

func BroadcastToRoom(skipConn *websocket.Conn, rideCode string, msg any) {
	config.RoomsMu.RLock()
	conns := make([]*websocket.Conn, 0, len(config.RideRooms[rideCode]))
	for conn := range config.RideRooms[rideCode] {

		if conn == skipConn {
			continue
		}
		conns = append(conns, conn)
	}
	config.RoomsMu.RUnlock()

	for _, conn := range conns {
		if err := conn.WriteJSON(msg); err != nil {
			CleanupConnection(conn)
		}
	}
}

func CleanupConnection(conn *websocket.Conn) {
	userID := config.ActiveUsers[conn]
	delete(config.ActiveUsers, conn)

	var ridesToNotify []string

	config.RoomsMu.Lock()
	for rideCode, members := range config.RideRooms {
		if _, ok := members[conn]; ok {
			delete(members, conn)
			ridesToNotify = append(ridesToNotify, rideCode)
		}
	}
	config.RoomsMu.Unlock()

	for _, rideCode := range ridesToNotify {
		BroadcastToRoom(conn, rideCode, map[string]any{
			"eventType": "userLeft",
			"data":      map[string]string{"userId": userID},
		})
	}

	conn.Close()
}
