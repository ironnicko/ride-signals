package models

import (
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type Signal struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    RideCode  string             `bson:"rideCode" json:"rideCode"`
    FromUser  primitive.ObjectID `bson:"fromUser" json:"fromUser"`
    Type      string             `bson:"type" json:"type"`
    Timestamp primitive.DateTime `bson:"timestamp" json:"timestamp"`
    Location  *GeoLocation       `bson:"location,omitempty" json:"location,omitempty"`
}

type GeoLocation struct {
    Lat float64 `bson:"lat" json:"lat"`
    Lng float64 `bson:"lng" json:"lng"`
}
