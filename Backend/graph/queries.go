package graph

import (
	"context"
	"errors"

	"github.com/ironnicko/ride-signals/Backend/db"
	"github.com/ironnicko/ride-signals/Backend/graph/model"
	"github.com/ironnicko/ride-signals/Backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func (r *queryResolver) Me(ctx context.Context) (*model.User, error) {
	userId := ctx.Value("userId").(string)

	oid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, errors.New("invalid userId")
	}

	var dbUser models.User
	coll := db.GetCollection("bikeapp", "users")

	err = coll.FindOne(ctx, bson.M{"_id": oid}).Decode(&dbUser)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &model.User{
		ID:    dbUser.ID.Hex(),
		Name:  dbUser.Name,
		Email: dbUser.Email,
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

	userID := primitive.NewObjectID().Hex()
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
