package utils

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
				CreatedAt:    primitive.NewDateTimeFromTime(time.Now().UTC()),
				LastLoginAt:  primitive.NewDateTimeFromTime(time.Now().UTC()),
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
			bson.M{"$set": bson.M{"lastLoginAt": primitive.NewDateTimeFromTime(time.Now().UTC())}},
		)
	}

	tokens, err := GenerateTokens(googleUser.Email)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"user": map[string]interface{}{
			"id":      userId,
			"name":    googleUser.Name,
			"email":   googleUser.Email,
			"picture": googleUser.Picture,
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
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code not found"})
		return
	}

	token, err := googleOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to exchange token"})
		return
	}

	client := googleOAuthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
		return
	}
	defer resp.Body.Close()

	var googleUser GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user info"})
		return
	}

	if !googleUser.VerifiedEmail {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Google account email not verified"})
		return
	}
	userResponse, err := handleGoogleUser(c, googleUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, userResponse)
}
