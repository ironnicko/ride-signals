"use client";

import { GoogleMap, useLoadScript, Marker, Autocomplete } from "@react-google-maps/api";
import { useEffect, useState, useRef, RefObject, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

export default function DashboardPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["maps", "places"],
  });

  const [fromLocation, setFromLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [toLocation, setToLocation] = useState<{ lat: number; lng: number } | null>(null);

  const autocompleteFromRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteToRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Get current user location for initial "From"
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFromLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }, []);

  const onLoadMap = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onLoadAutocomplete = (
    autocompleteRef: RefObject<google.maps.places.Autocomplete | null>,
    autocomplete: google.maps.places.Autocomplete
  ) => {
    autocompleteRef.current = autocomplete;
  };

  /** 
   * Separate handler for "From" field 
   */
  const handleFromPlaceChanged = () => {
    if (autocompleteFromRef.current) {
      const place = autocompleteFromRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setFromLocation({ lat, lng });
      }
    }
  };

  /** 
   * Separate handler for "To" field 
   */
  const handleToPlaceChanged = () => {
    if (autocompleteToRef.current) {
      const place = autocompleteToRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setToLocation({ lat, lng });
      }
    }
  };

  /**
   * Fit the map to both markers when both locations are available
   */
  useEffect(() => {
    if (mapRef.current && fromLocation && toLocation) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(fromLocation);
      bounds.extend(toLocation);
      mapRef.current.fitBounds(bounds);
    }
  }, [fromLocation, toLocation]);

  if (!isLoaded) return <p className="p-4">Loading Maps...</p>;
  if (!fromLocation) return <p className="p-4">Fetching current location...</p>;

  return (
    <ProtectedRoute>
      <div className="relative w-full h-screen">
        {/* Google Map */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={fromLocation}
          zoom={14}
          onLoad={onLoadMap}
        >
          {/* From location marker */}
          <Marker position={fromLocation} />
          {/* To location marker */}
          {toLocation && <Marker position={toLocation} />}
        </GoogleMap>

        {/* Trip Planning Inputs */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 w-80">
            <div className="mb-4 text-center">
              <h2 className="text-lg font-semibold">Plan Your Trip</h2>
              <p className="text-sm text-gray-500">Enter your trip details below</p>
            </div>

            <div className="flex flex-col gap-3">
              {/* From Location Input */}
              <Autocomplete
                onLoad={(autocomplete) => onLoadAutocomplete(autocompleteFromRef, autocomplete)}
                onPlaceChanged={handleFromPlaceChanged}
              >
                <input
                  type="text"
                  placeholder="From..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </Autocomplete>

              {/* To Location Input */}
              <Autocomplete
                onLoad={(autocomplete) => onLoadAutocomplete(autocompleteToRef, autocomplete)}
                onPlaceChanged={handleToPlaceChanged}
              >
                <input
                  type="text"
                  placeholder="To..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </Autocomplete>
            </div>

            <button className="cursor-pointer mt-6 w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
              Next
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
