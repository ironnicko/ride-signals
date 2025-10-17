package main

import (
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	config "github.com/ironnicko/ride-signals/Backend/config"
	"github.com/ironnicko/ride-signals/Backend/db"
	"github.com/ironnicko/ride-signals/Backend/routes"
	"github.com/ironnicko/ride-signals/Backend/utils"
	"github.com/joho/godotenv"
)

func main() {
	config.LoadConfig()
	cfg := config.Envs
	if cfg.Mode != "Prod" {
		godotenv.Load(".env.local")
		config.LoadConfig()
		cfg = config.Envs
	}
	fmt.Println(cfg)

	db.Connect(cfg.MongoURI)
	// kafka.InitProducer(cfg.KafkaBrokers)
	utils.InitJWT(cfg.JWTSecret, cfg.RefreshJWTSecret)
	utils.InitGoogleOAuth(
		cfg.GoogleClientID,
		cfg.GoogleClientSecret,
		cfg.GoogleRedirectURL,
	)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	routes.InitializeRoutes(r)

	r.Run(":" + cfg.ServerPort)

}
