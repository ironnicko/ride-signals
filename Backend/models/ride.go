package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Ride struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	RideCode        string             `bson:"rideCode" json:"rideCode"`
	Status          string             `bson:"status" json:"status"`
	CreatedAt       string             `bson:"createdAt" json:"createdAt"`
	CreatedBy       primitive.ObjectID `bson:"createdBy,omitempty" json:"createdBy"`
	EndedAt         *string            `bson:"endedAt,omitempty" json:"endedAt,omitempty"`
	StartedAt       *string            `bson:"startedAt,omitempty" json:"startedAt,omitempty"`
	Participants    []Participant      `bson:"participants" json:"participants"`
	Settings        RideSettings       `bson:"settings" json:"settings"`
	Start           GeoLocation        `bson:"start" json:"start"`
	Destination     GeoLocation        `bson:"destination" json:"destination"`
	StartName       string             `bson:"startName" json:"startName"`
	DestinationName string             `bson:"destinationName" json:"destinationName"`
	TripName        string             `bson:"tripName" json:"tripName"`
}

type Participant struct {
	UserID   primitive.ObjectID `bson:"userId" json:"userId"`
	Role     string             `bson:"role" json:"role"`
	JoinedAt string             `bson:"joinedAt" json:"joinedAt"`
}

type RideSettings struct {
	MaxRiders  int    `bson:"maxRiders" json:"maxRiders"`
	Visibility string `bson:"visibility" json:"visibility"`
}

type GeoLocation struct {
	Lat float64 `bson:"lat" json:"lat"`
	Lng float64 `bson:"lng" json:"lng"`
}
