package graph

import (
	"context"
	"encoding/json"
	"time"

	"github.com/ironnicko/ride-signals/db"
	"github.com/ironnicko/ride-signals/graph/model"
	"github.com/ironnicko/ride-signals/kafka"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (r *mutationResolver) CreateRide(ctx context.Context, maxRiders int, visibility string) (*model.Ride, error) {
	ride := &model.Ride{
		ID:       primitive.NewObjectID().Hex(),
		RideCode: primitive.NewObjectID().Hex()[:6],
		Status:   "active",
		Settings: &model.RideSettings{
			MaxRiders:  maxRiders,
			Visibility: visibility,
		},
		Participants: []*model.Participant{},
		CreatedAt:    time.Now().Format(time.RFC3339),
	}

	coll := db.GetCollection("bikeapp", "rides")
	_, err := coll.InsertOne(ctx, ride)
	if err != nil {
		return nil, err
	}
	return ride, nil
}

func (r *mutationResolver) JoinRide(ctx context.Context, rideCode string, role string) (*model.Ride, error) {
	// TODO: replace with JWT user
	user := &model.User{
		ID:    primitive.NewObjectID().Hex(),
		Name:  "Test User",
		Email: "test@example.com",
	}

	participant := &model.Participant{
		UserID:   user.ID,
		Role:     role,
		JoinedAt: time.Now().Format(time.RFC3339),
	}

	coll := db.GetCollection("bikeapp", "rides")
	_, err := coll.UpdateOne(
		ctx,
		bson.M{"rideCode": rideCode},
		bson.M{"$push": bson.M{"participants": participant}},
	)
	if err != nil {
		return nil, err
	}

	var ride model.Ride
	err = coll.FindOne(ctx, bson.M{"rideCode": rideCode}).Decode(&ride)
	if err != nil {
		return nil, err
	}

	return &ride, nil
}

func (r *mutationResolver) SendSignal(ctx context.Context, rideCode string, signalType string, lat *float64, lng *float64) (bool, error) {
	sig := model.Signal{
		ID:        primitive.NewObjectID().Hex(),
		RideCode:  rideCode,
		Type:      signalType,
		Timestamp: time.Now().Format(time.RFC3339),
	}

	if lat != nil && lng != nil {
		sig.Location = &model.GeoLocation{Lat: *lat, Lng: *lng}
	}

	coll := db.GetCollection("bikeapp", "signals")
	_, err := coll.InsertOne(ctx, sig)
	if err != nil {
		return false, err
	}

	msg, _ := json.Marshal(sig)
	kafka.PublishSignal(rideCode, msg)

	return true, nil
}
