package graph

import (
	"fmt"
	"github.com/ironnicko/ride-signals/Backend/graph/model"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

func getGeoLocation(lat *float64, lng *float64) (*model.GeoLocation, error) {
	if lat != nil && lng != nil {
		return &model.GeoLocation{Lat: *lat, Lng: *lng}, nil
	}
	return nil, fmt.Errorf("Latitute or Longitude wasn't provided!")
}

type Resolver struct{}
