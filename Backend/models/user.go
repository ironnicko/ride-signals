package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name             string             `bson:"name" json:"name"`
	Email            string             `bson:"email" json:"email"`
	PasswordHash     string             `bson:"passwordHash" json:"-"`
	CreatedAt        string             `bson:"createdAt" json:"createdAt"`
	LastLoginAt      string             `bson:"lastLoginAt" json:"lastLoginAt"`
	IsActive         bool               `bson:"isActive" json:"isActive"`
	CurrentRide      *string            `bson:"currentRide,omitempty" json:"currentRide,omitempty"`
	Picture          *string            `bson:"picture,omitempty" json:"picture,omitempty"`
	PushSubscription *PushSubscription  `bson:"pushSubscription,omitempty" json:"pushSubscription,omitempty"`
}

type PushSubscription struct {
	Endpoint string               `json:"endpoint"`
	Keys     PushSubscriptionKeys `json:"keys"`
	
}

type PushSubscriptionKeys struct {
	P256dh string `json:"p256dh"`
	Auth   string `json:"auth"`
}
