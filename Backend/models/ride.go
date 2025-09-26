package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Ride struct {
	ID           primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	RideCode     string              `bson:"rideCode" json:"rideCode"`
	Status       string              `bson:"status" json:"status"`
	CreatedAt    primitive.DateTime  `bson:"createdAt" json:"createdAt"`
	EndedAt      *primitive.DateTime `bson:"endedAt,omitempty" json:"endedAt,omitempty"`
	Participants []Participant       `bson:"participants" json:"participants"`
	Settings     RideSettings        `bson:"settings" json:"settings"`
	Start        GeoLocation         `bson:"start" json:"start"`
	Destination  GeoLocation         `bson:"destination" json:"destination"`
}

type Participant struct {
	UserID   primitive.ObjectID `bson:"userId" json:"userId"`
	Role     string             `bson:"role" json:"role"`
	JoinedAt primitive.DateTime `bson:"joinedAt" json:"joinedAt"`
}

type RideSettings struct {
	MaxRiders  int    `bson:"maxRiders" json:"maxRiders"`
	Visibility string `bson:"visibility" json:"visibility"`
}

type GeoLocation struct {
	Lat float64 `bson:"lat" json:"lat"`
	Lng float64 `bson:"lng" json:"lng"`
}
