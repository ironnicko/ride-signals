package model

type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type Participant struct {
	UserID   string `json:"userId"`
	Role     string `json:"role"`
	JoinedAt string `json:"joinedAt"`
}

type RideSettings struct {
	MaxRiders  int    `json:"maxRiders"`
	Visibility string `json:"visibility"`
}

type Ride struct {
	ID           string         `json:"id"`
	RideCode     string         `json:"rideCode"`
	Status       string         `json:"status"`
	Participants []*Participant `json:"participants"`
	Settings     *RideSettings  `json:"settings"`
	CreatedAt    string         `json:"createdAt"`
}

type GeoLocation struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type Signal struct {
	ID        string       `json:"id"`
	RideCode  string       `json:"rideCode"`
	Type      string       `json:"type"`
	Location  *GeoLocation `json:"location,omitempty"`
	Timestamp string       `json:"timestamp"`
}
