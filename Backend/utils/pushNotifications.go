package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"

	"github.com/SherClockHolmes/webpush-go"
	"github.com/ironnicko/tandem-sync/Backend/config"
	"github.com/ironnicko/tandem-sync/Backend/models"
)

type NotificationPayload struct {
	Title string `json:"title"`
	Body  string `json:"body"`
	Icon  string `json:"icon"`
}

func SendNotification(subscription *models.PushSubscription, title string, message string, icon string) (bool, error) {
	cfg := config.Envs
	if subscription == nil || subscription.Endpoint == "" {
		return false, fmt.Errorf("no subscription available")
	}

	payload := NotificationPayload{
		Title: title,
		Body:  message,
		Icon:  icon,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return false, fmt.Errorf("failed to marshal payload: %w", err)
	}

	resp, err := webpush.SendNotification(data, &webpush.Subscription{
		Endpoint: subscription.Endpoint,
		Keys: webpush.Keys{
			P256dh: subscription.Keys.P256dh,
			Auth:   subscription.Keys.Auth,
		},
	}, &webpush.Options{
		Subscriber:      cfg.MyEmail,
		VAPIDPublicKey:  cfg.VAPIDPublickey,
		VAPIDPrivateKey: cfg.VAPIDPrivatekey,
	})
	if err != nil {
		log.Println("Error sending push notification:", err)
		// fmt.Errorf("failed to send notification: %w", err)
	}
	defer resp.Body.Close()

	// Optional: read response body for debugging
	buf := new(bytes.Buffer)
	buf.ReadFrom(resp.Body)
	if resp.StatusCode >= 400 {
		// fmt.Errorf("push service responded with %d: %s", resp.StatusCode, buf.String())
	}

	return true, nil
}
