package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/ironnicko/tandem-sync/Backend/db"
	"github.com/ironnicko/tandem-sync/Backend/models"
	"github.com/ironnicko/tandem-sync/Backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func Signup(c *gin.Context) {
	var usersColl = db.GetCollection("bikeapp", "users")
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 12)

	user := models.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hash),
		CreatedAt:    time.Now().UTC().Format(time.RFC3339),
		LastLoginAt:  time.Now().UTC().Format(time.RFC3339),
		IsActive:     true,
	}

	insertedRecord, err := usersColl.InsertOne(context.Background(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	userId := insertedRecord.InsertedID.(primitive.ObjectID).Hex()

	tokenPair, err := utils.GenerateTokens(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access and refresh tokens"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"accessToken":  tokenPair.AccessToken,
		"refreshToken": tokenPair.RefreshToken,
		"user": gin.H{
			"id":    userId,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

func Login(c *gin.Context) {
	var usersColl = db.GetCollection("bikeapp", "users")

	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user by email
	var user models.User
	err := usersColl.FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Update last login
	_, _ = usersColl.UpdateByID(
		context.Background(),
		user.ID,
		bson.M{"$set": bson.M{"lastLoginAt": time.Now().UTC().Format(time.RFC3339)}},
	)

	tokenPair, err := utils.GenerateTokens(user.ID.Hex())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access and refresh tokens"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accessToken":  tokenPair.AccessToken,
		"refreshToken": tokenPair.RefreshToken,
		"user": gin.H{
			"id":               user.ID.Hex(),
			"name":             user.Name,
			"email":            user.Email,
			"currentRide":      user.CurrentRide,
			"picture":          user.Picture,
			"pushSubscription": user.PushSubscription,
		},
	})
}

func Authenticated(c *gin.Context) {
	userIDHex := c.Value("userId").(string)
	c.JSON(http.StatusOK, gin.H{
		"id": userIDHex,
	})

}

func RefreshAccessToken(c *gin.Context) {
	var request struct {
		RefreshToken string `json:"refreshToken"`
	}

	if err := c.BindJSON(&request); err != nil || request.RefreshToken == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	userId, err := utils.ValidateToken(request.RefreshToken, true)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	signedAccessToken, err := utils.GenerateAccessToken(userId)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unable to generate Access Token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accessToken": signedAccessToken,
	})
}
