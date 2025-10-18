package types

import "github.com/golang-jwt/jwt/v5"

type Payload struct {
	RideCode   string      `json:"rideCode"`
	FromUser   string      `json:"fromUser"`
	Location   GeoLocation `json:"location"`
	SignalType string      `json:"signalType"`
}

type JwtPayload struct {
	UserID string `json:"userId"`
	jwt.RegisteredClaims
}

type GeoLocation struct {
	Lat float64 `bson:"lat" json:"lat"`
	Lng float64 `bson:"lng" json:"lng"`
}

type Message struct {
	EventType string  `json:"eventType"`
	Data      Payload `json:"data"`
}
