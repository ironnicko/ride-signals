package utils

import (
    "github.com/golang-jwt/jwt/v5"
    "time"
)

var jwtKey []byte

func InitJWT(secret string) {
    jwtKey = []byte(secret)
}

func GenerateToken(userId string) (string, error) {
    claims := &jwt.MapClaims{
        "userId": userId,
        "exp": time.Now().Add(24 * time.Hour).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtKey)
}
