package utils

import (
	"crypto/rand"
	"crypto/sha1"
	"crypto/sha256"
	"encoding/hex"
	"time"
)

func GenRideCode() string {
	timestamp := time.Now().UTC().UTC().Format(time.RFC3339)
	hash := sha1.Sum([]byte(timestamp))
	return hex.EncodeToString(hash[:])[:8]
}

func GenerateRandomHash() string {
	randomBytes := make([]byte, 32)
	rand.Read(randomBytes)

	hasher := sha256.New()
	hasher.Write(randomBytes)
	hashBytes := hasher.Sum(nil)

	return hex.EncodeToString(hashBytes)
}
