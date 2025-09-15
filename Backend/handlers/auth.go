package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/ironnicko/ride-signals/db"
	"github.com/ironnicko/ride-signals/models"
	"github.com/ironnicko/ride-signals/utils"

	"github.com/gin-gonic/gin"
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
		CreatedAt:    primitive.NewDateTimeFromTime(time.Now()),
		LastLoginAt:  primitive.NewDateTimeFromTime(time.Now()),
		IsActive:     true,
	}

	_, err := usersColl.InsertOne(context.Background(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	token, _ := utils.GenerateToken(user.ID.Hex())
	c.JSON(http.StatusOK, gin.H{"token": token})
}
