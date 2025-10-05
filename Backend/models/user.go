package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string             `bson:"name" json:"name"`
	Email        string             `bson:"email" json:"email"`
	PasswordHash string             `bson:"passwordHash" json:"-"`
	CreatedAt    string             `bson:"createdAt" json:"createdAt"`
	LastLoginAt  string             `bson:"lastLoginAt" json:"lastLoginAt"`
	IsActive     bool               `bson:"isActive" json:"isActive"`
	CurrentRide  *string            `bson:"currentRide,omitempty" json:"currentRide,omitempty"`
}
