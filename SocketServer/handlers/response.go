package handlers

import (
	"log"
	"net/http"

	"github.com/ironnicko/tandem-sync/SocketServer/config"
	"github.com/ironnicko/tandem-sync/SocketServer/types"
	"github.com/ironnicko/tandem-sync/SocketServer/utils"
)

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	userID, ok := utils.IsValidToken(token)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	conn, err := config.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade error:", err)
		return
	}
	defer conn.Close()

	config.ActiveUsers[conn] = userID
	log.Printf("✅ User connected: %s", userID)

	for {
		var msg types.Message
		if err := conn.ReadJSON(&msg); err != nil {
			log.Printf("❌ Disconnected %s: %v", userID, err)
			utils.CleanupConnection(conn)
			break
		}

		switch msg.EventType {
		case "joinRide":
			var payload types.Payload = msg.Data
			handleJoinRide(conn, userID, payload)
		case "leaveRide":
			var payload types.Payload = msg.Data
			handleLeaveRide(conn, userID, payload)
		case "sendLocation":
			var payload types.Payload = msg.Data
			handleSendLocation(conn, userID, payload)
		case "sendSignal":
			var payload types.Payload = msg.Data
			handleSendSignal(userID, payload)
		}
	}
}
