package routes

import (
	"context"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	"github.com/ironnicko/ride-signals/Backend/graph"
	"github.com/ironnicko/ride-signals/Backend/handlers"
	"github.com/ironnicko/ride-signals/Backend/utils"
)

func InitializeRoutes(r *gin.Engine) {

	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

	v1 := r.Group("/api/v1")

	// Google Oauth2
	v1.GET("/auth/google", utils.GoogleLoginHandler)
	v1.POST("/auth/google", utils.GoogleLoginHandler)
	v1.GET("/auth/google/callback", utils.GoogleCallbackHandler)

	// REST
	v1.POST("/signup", handlers.Signup)
	v1.POST("/login", handlers.Login)
	v1.POST("/refresh", handlers.RefreshAccessToken)

	// GraphQL
	v1.GET("/playground", gin.WrapH(playground.Handler("GraphQL Playground", "/api/v1/graphql")))

	// Authenticated
	v1.Use(utils.AuthMiddleware())
	// v1.POST("/graphql", gin.WrapH(srv))
	v1.POST("/authenticated", func(c *gin.Context) {
	})
	v1.POST("/graphql", func(c *gin.Context) {
		userID, _ := c.Get("userId")
		ctx := context.WithValue(c.Request.Context(), "userId", userID)
		req := c.Request.WithContext(ctx)
		srv.ServeHTTP(c.Writer, req)
	})

}
