package graph

import (
	"context"

	"github.com/ironnicko/ride-signals/Backend/db"
	"github.com/ironnicko/ride-signals/Backend/graph/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (r *queryResolver) Me(ctx context.Context) (*model.User, error) {
	// TODO: replace with JWT user
	return &model.User{
		ID:    primitive.NewObjectID().Hex(),
		Name:  "Test User",
		Email: "test@example.com",
	}, nil
}

func (r *queryResolver) Ride(ctx context.Context, rideCode string) (*model.Ride, error) {
	coll := db.GetCollection("bikeapp", "rides")
	var ride model.Ride
	err := coll.FindOne(ctx, bson.M{"rideCode": rideCode}).Decode(&ride)
	if err != nil {
		return nil, err
	}
	return &ride, nil
}

func (r *queryResolver) MyRides(ctx context.Context) ([]*model.Ride, error) {
	// TODO: replace with JWT user
	userID := primitive.NewObjectID().Hex() // dummy
	coll := db.GetCollection("bikeapp", "rides")
	cursor, err := coll.Find(ctx, bson.M{"participants.userId": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var rides []*model.Ride
	for cursor.Next(ctx) {
		var ride model.Ride
		if err := cursor.Decode(&ride); err != nil {
			return nil, err
		}
		rides = append(rides, &ride)
	}
	return rides, nil
}
