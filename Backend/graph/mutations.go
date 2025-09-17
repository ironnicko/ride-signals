package graph

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/ironnicko/ride-signals/Backend/db"
	"github.com/ironnicko/ride-signals/Backend/graph/model"
	"github.com/ironnicko/ride-signals/Backend/kafka"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *mutationResolver) CreateRide(ctx context.Context, maxRiders int, visibility string) (*model.Ride, error) {
	userId := ctx.Value("userId").(string)
	participants := []*model.Participant{
		{
			UserID:   userId,
			Role:     "member",
			JoinedAt: time.Now().Format(time.RFC3339),
		},
	}

	ride := &model.Ride{
		ID:       primitive.NewObjectID().Hex(),
		RideCode: primitive.NewObjectID().Hex()[:6],
		Status:   "active",
		Settings: &model.RideSettings{
			MaxRiders:  maxRiders,
			Visibility: visibility,
		},
		Participants: participants,
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

	userIdVal := ctx.Value("userId")
	if userIdVal == nil {
		return nil, errors.New("unauthorized: no userId in context")
	}

	userIdHex, ok := userIdVal.(string)
	if !ok {
		return nil, errors.New("invalid userId type in context")
	}

	userID, err := primitive.ObjectIDFromHex(userIdHex)
	if err != nil {
		return nil, fmt.Errorf("invalid userId format: %w", err)
	}

	coll := db.GetCollection("bikeapp", "rides")

	var ride model.Ride
	err = coll.FindOne(ctx, bson.M{"rideCode": rideCode}).Decode(&ride)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("ride not found")
		}
		return nil, fmt.Errorf("failed to fetch ride: %w", err)
	}

	for _, p := range ride.Participants {
		if p.UserID == userID.Hex() {
			return &ride, nil
		}
	}

	if len(ride.Participants) >= ride.Settings.MaxRiders {
		return nil, fmt.Errorf("ride is full: max riders = %d", ride.Settings.MaxRiders)
	}

	participant := model.Participant{
		UserID:   userID.Hex(),
		Role:     role,
		JoinedAt: time.Now().Format(time.RFC3339),
	}

	update := bson.M{"$push": bson.M{"participants": participant}}
	res := coll.FindOneAndUpdate(
		ctx,
		bson.M{"rideCode": rideCode},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	var updatedRide model.Ride
	if err := res.Decode(&updatedRide); err != nil {
		return nil, fmt.Errorf("failed to decode updated ride: %w", err)
	}

	return &updatedRide, nil
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
