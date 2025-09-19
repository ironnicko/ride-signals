package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func EnsureUsersEmailIndex(client *mongo.Client, ctx context.Context) {

	usersColl := client.Database("bikeapp").Collection("users")

	indexModel := mongo.IndexModel{
		Keys: bson.D{{Key: "email", Value: 1}},
		Options: options.Index().
			SetUnique(true).
			SetName("email_unique_index"),
	}

	name, err := usersColl.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		log.Printf("Failed to create index on users.email: %v", err)
		return
	}

	log.Printf("Index ensured on users.email: %s", name)
}

func Connect(uri string) *mongo.Client {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatalf("MongoDB connection error: %v", err)
	}

	if err = client.Ping(ctx, nil); err != nil {
		log.Fatalf("MongoDB ping failed: %v", err)
	}

	log.Println("Connected to MongoDB")
	Client = client
	EnsureUsersEmailIndex(client, ctx)
	return client
}

func GetCollection(dbName, collName string) *mongo.Collection {
	return Client.Database(dbName).Collection(collName)
}
