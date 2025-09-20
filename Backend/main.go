package main

import (
	"fmt"

	// "github.com/99designs/gqlgen"
	// "github.com/99designs/gqlgen/api"
	// "github.com/99designs/gqlgen/internal/imports"
	// "github.com/99designs/gqlgen/codegen/config"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ironnicko/ride-signals/Backend/config"
	"github.com/ironnicko/ride-signals/Backend/db"
	"github.com/ironnicko/ride-signals/Backend/kafka"
	"github.com/ironnicko/ride-signals/Backend/routes"
	"github.com/ironnicko/ride-signals/Backend/utils"
	"github.com/joho/godotenv"
)

func main() {
	cfg := config.LoadConfig()

	if cfg.Mode != "Prod" {
		godotenv.Load(".env.local")
		cfg = config.LoadConfig()
	}
	fmt.Println(cfg)

	db.Connect(cfg.MongoURI)
	kafka.InitProducer(cfg.KafkaBrokers)
	utils.InitJWT(cfg.JWTSecret)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			return true
		},
		AllowCredentials: true,
	}))

	routes.InitializeRoutes(r)

	r.Run(":" + cfg.ServerPort)

}
