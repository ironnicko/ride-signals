package utils

import (
	"fmt"
	"time"

	"github.com/ironnicko/tandem-sync/SocketServer/config"
)

func AddParticipant(rideCode, userID string) error {
	key := fmt.Sprintf("ride:%s", rideCode)
	pipe := config.RedisClient.TxPipeline()
	pipe.SAdd(config.CTX, key, userID)
	pipe.Expire(config.CTX, key, 60*time.Second)
	_, err := pipe.Exec(config.CTX)
	return err
}

func RemoveParticipant(rideCode, userID string) error {
	key := fmt.Sprintf("ride:%s", rideCode)
	pipe := config.RedisClient.TxPipeline()
	pipe.SRem(config.CTX, key, userID)
	pipe.HDel(config.CTX, key+":locations", userID)
	_, err := pipe.Exec(config.CTX)
	return err
}
