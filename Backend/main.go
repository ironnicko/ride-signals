package main

import (
	"fmt"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ironnicko/ride-signals/Backend/config"
	"github.com/ironnicko/ride-signals/Backend/db"
	"github.com/ironnicko/ride-signals/Backend/graph"
	"github.com/ironnicko/ride-signals/Backend/handlers"
	"github.com/ironnicko/ride-signals/Backend/kafka"
	"github.com/ironnicko/ride-signals/Backend/utils"
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

	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			return true
		},
		AllowCredentials: true,
	}))

	v1 := r.Group("/api/v1")

	// REST
	v1.POST("/signup", handlers.Signup)
	v1.POST("/login", handlers.Login)

	// GraphQL
	v1.GET("/playground", gin.WrapH(playground.Handler("GraphQL Playground", "/api/v1/graphql")))

		// Authenticated
	v1.Use(utils.AuthMiddleware())
	v1.POST("/graphql", gin.WrapH(srv))

	r.Run(":" + cfg.ServerPort)
}
