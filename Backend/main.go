package main

import (
	"fmt"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	"github.com/ironnicko/ride-signals/config"
	"github.com/ironnicko/ride-signals/db"
	"github.com/ironnicko/ride-signals/graph"
	"github.com/ironnicko/ride-signals/handlers"
	"github.com/ironnicko/ride-signals/kafka"
	"github.com/ironnicko/ride-signals/utils"

	"github.com/joho/godotenv"
)

func main() {
	cfg := config.LoadConfig()

	if cfg.PRODUCTION != "PROD" {
		godotenv.Load(".env.local")
		cfg = config.LoadConfig()
	}
	fmt.Println(cfg)

	db.Connect(cfg.MongoURI)
	kafka.InitProducer(cfg.KafkaBrokers)
	utils.InitJWT(cfg.JWTSecret)

	r := gin.Default()

	v1 := r.Group("/api/v1")

	// REST auth
	v1.POST("/signup", handlers.Signup)
	// r.POST("/login", handlers.Login)

	// GraphQL
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))
	v1.POST("/graphql", gin.WrapH(srv))
	v1.GET("/playground", gin.WrapH(playground.Handler("GraphQL Playground", "/api/v1/graphql")))

	r.Run(":" + cfg.ServerPort)
}
