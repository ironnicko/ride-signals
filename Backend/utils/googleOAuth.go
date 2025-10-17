package utils

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ironnicko/ride-signals/Backend/config"
	"github.com/ironnicko/ride-signals/Backend/db"
	"github.com/ironnicko/ride-signals/Backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/oauth2"
	"google.golang.org/api/idtoken"
)

var googleOAuthConfig *oauth2.Config

func InitGoogleOAuth(clientID, clientSecret, redirectURL string) {
	googleOAuthConfig = &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://accounts.google.com/o/oauth2/auth",
			TokenURL: "https://oauth2.googleapis.com/token",
		},
	}
}

type GoogleUser struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`
}

func handleGoogleUser(c *gin.Context, googleUser GoogleUser) (map[string]interface{}, error) {
	coll := db.GetCollection("bikeapp", "users")

	var dbUser models.User
	err := coll.FindOne(c, bson.M{"email": googleUser.Email}).Decode(&dbUser)

	var userId string
	if err != nil {
		if err == mongo.ErrNoDocuments {

			newUser := models.User{
				Name:         googleUser.Name,
				Email:        googleUser.Email,
				PasswordHash: GenerateRandomHash(),
				CreatedAt:    time.Now().UTC().Format(time.RFC3339),
				LastLoginAt:  time.Now().UTC().Format(time.RFC3339),
				Picture:      &googleUser.Picture,
				IsActive:     true,
			}

			inserted, err := coll.InsertOne(context.Background(), &newUser)
			if err != nil {
				return nil, err
			}
			userId = inserted.InsertedID.(primitive.ObjectID).Hex()
		} else {
			return nil, err
		}
	} else {

		userId = dbUser.ID.Hex()
		_, _ = coll.UpdateOne(
			context.Background(),
			bson.M{"_id": dbUser.ID},
			bson.M{"$set": bson.M{"lastLoginAt": time.Now().UTC().Format(time.RFC3339)}},
		)
	}

	tokens, err := GenerateTokens(userId)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"user": map[string]interface{}{
			"id":               userId,
			"name":             googleUser.Name,
			"email":            googleUser.Email,
			"picture":          googleUser.Picture,
			"currentRide":      dbUser.CurrentRide,
			"isActive":         dbUser.IsActive,
			"pushSubscription": dbUser.PushSubscription,
		},
		"accessToken":  tokens.AccessToken,
		"refreshToken": tokens.RefreshToken,
	}, nil
}

func GoogleLoginHandler(c *gin.Context) {
	if c.Request.Method == http.MethodPost {
		var req struct {
			IDToken string `json:"idToken" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "idToken is required"})
			return
		}

		payload, err := idtoken.Validate(context.Background(), req.IDToken, googleOAuthConfig.ClientID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google ID token"})
			return
		}

		googleUser := GoogleUser{
			Email:         payload.Claims["email"].(string),
			VerifiedEmail: payload.Claims["email_verified"].(bool),
			Name:          payload.Claims["name"].(string),
			Picture:       payload.Claims["picture"].(string),
		}

		if !googleUser.VerifiedEmail {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Google email not verified"})
			return
		}

		userResponse, err := handleGoogleUser(c, googleUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, userResponse)
		return
	}

	state := uuid.New().String()
	url := googleOAuthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func GoogleCallbackHandler(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")
	cfg := config.Envs

	if code == "" {
		c.Redirect(http.StatusTemporaryRedirect, "/signin")
		return
	}

	token, err := googleOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/signin")
		return
	}

	client := googleOAuthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/signin")
		return
	}
	defer resp.Body.Close()

	var googleUser GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/signin")
		return
	}

	if !googleUser.VerifiedEmail {
		c.Redirect(http.StatusTemporaryRedirect, "/signin")
		return
	}

	userResponse, err := handleGoogleUser(c, googleUser)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/signin")
		return
	}

	frontendRedirect := fmt.Sprintf(
		"%s/google-redirect?response=%s&redirect=%s",
		cfg.FrontendURL,
		url.QueryEscape(base64.StdEncoding.EncodeToString(mustJSON(userResponse))),
		url.QueryEscape(state),
	)
	c.Redirect(http.StatusTemporaryRedirect, frontendRedirect)
}

func mustJSON(v interface{}) []byte {
	data, _ := json.Marshal(v)
	return data
}
