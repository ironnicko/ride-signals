package utils

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var (
	jwtKey        []byte
	refreshJwtKey []byte
)

func InitJWT(secret, refreshSecret string) {
	jwtKey = []byte(secret)
	refreshJwtKey = []byte(refreshSecret)
}

type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

func GenerateAccessToken(userId string) (string, error) {
	accessClaims := &jwt.MapClaims{
		"userId": userId,
		"exp":    time.Now().UTC().Add(15 * time.Minute).Unix(),
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	signedAccessToken, err := accessToken.SignedString(jwtKey)
	if err != nil {
		return "", err
	}
	return signedAccessToken, nil
}

func GenerateTokens(userId string) (*TokenPair, error) {

	signedAccessToken, err := GenerateAccessToken(userId)
	if err != nil {
		return nil, err
	}

	refreshClaims := &jwt.MapClaims{
		"userId": userId,
		"exp":    time.Now().UTC().Add(7 * 24 * time.Hour).Unix(),
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err := refreshToken.SignedString(refreshJwtKey)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  signedAccessToken,
		RefreshToken: signedRefreshToken,
	}, nil
}

func ValidateToken(tokenString string, isRefresh bool) (string, error) {
	secret := jwtKey
	if isRefresh {
		secret = refreshJwtKey
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return secret, nil
	})

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if userID, ok := claims["userId"].(string); ok {
			return userID, nil
		}
	}

	return "", errors.New("invalid token claims")
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid auth header format"})
			c.Abort()
			return
		}

		tokenString := parts[1]

		userId, err := ValidateToken(tokenString, false)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired access token"})
			c.Abort()
			return
		}

		c.Set("userId", userId)
		c.Next()
	}
}