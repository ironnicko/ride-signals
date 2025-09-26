"use client";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useEffect, useState, useRef, useCallback } from "react";
import { useMutation } from "@apollo/client/react"
import { CREATE_RIDE, GeoLocation } from "@/lib/graphql/schema";
import ProtectedRoute from "@/components/ProtectedRoute";
import { TripLocationInputs } from "./TripLocationInputs";
import { TripSettingsInputs } from "./TripSettingsInputs";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

export default function DashboardPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["maps", "places"],
  });

  const [createRide] = useMutation(CREATE_RIDE);
  const [formIndex, setFormIndex] = useState<number>(0);
  const [toLocation, setToLocation] = useState<GeoLocation | null>(null);
  const [fromLocation, setFromLocation] = useState<GeoLocation | null>(null);
  const [maxRiders, setMaxRiders] = useState<number>(1);
  const [visibility, setVisibility] = useState<"public" | "private">("private");

  const mapRef = useRef<google.maps.Map | null>(null);

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



  const CreateRide = async ()=> {
    try{
        const res = await createRide({
          variables: {
              maxRiders,
              visibility,
              startLat: fromLocation!.lat,
              startLng: fromLocation!.lng,
              destinationLat: toLocation!.lat,
              destinationLng: toLocation!.lng,
          },
      })
      if (res.error){
        console.log(res.error)
      }
    } catch(err){
      // Handle Error!
    }
  };

  const renderFormInput = () => {
    switch(formIndex){
      case 0:
        return <TripLocationInputs 
                setFormIndex={setFormIndex}
                setFromLocation={setFromLocation}
                setToLocation={setToLocation}
                fromLocation={fromLocation}
                toLocation={toLocation}
        >
        </TripLocationInputs>;
      case 1:
        return <TripSettingsInputs
                setMaxRiders={setMaxRiders}
                setVisibility={setVisibility}
                maxRiders={maxRiders}
                visibility={visibility}
                CreateRide={CreateRide}
        ></TripSettingsInputs>
    }
  }


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
      <div className="relative w-screen h-screen">
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

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 w-80">
            {renderFormInput()}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
