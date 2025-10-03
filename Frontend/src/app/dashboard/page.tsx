"use client";
import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_RIDE } from "@/lib/graphql/mutation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { TripLocationInputs } from "./CreateTrip/TripLocationInputs";
import { TripSettingsInputs } from "./CreateTrip/TripSettingsInputs";
import {
  AdvancedMarker,
  Map,
} from "@vis.gl/react-google-maps";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { FitBoundsHandler } from "@/components/FitBoundsHelper";
import { GeoLocation, RideState } from "@/stores/types";
import BottomSection from "./CreateTrip/BottomSection";
import { useAuth } from "@/stores/useAuth";
import { OnGoingTrip } from "./OnGoingTrip/OnGoingTrip";
import { CircleDot } from "lucide-react";
import { useRides } from "@/stores/useRides";

export default function DashboardPage() {
  const [createRide] = useMutation<{createRide: RideState}>(CREATE_RIDE);
  const [formIndex, setFormIndex] = useState<number>(0);
  const [toLocation, setToLocation] = useState<GeoLocation | null>(null);
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [fromLocation, setFromLocation] = useState<GeoLocation | null>(null);
  const [toLocationName, setToLocationName] = useState<string | null>(null);
  const [fromLocationName, setFromLocationName] = useState<string | null>(null);
  const [maxRiders, setMaxRiders] = useState<number>(5);
  const {user} = useAuth.getState();
  const {rides, setRides} = useRides.getState();
  const [visibility, setVisibility] = useState<"public" | "private">("private");

  const router = useRouter();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }, []);


  const CreateRide = async () => {
    try {
      const {data} = await createRide({
        variables: {
          maxRiders,
          visibility,
          startLat: fromLocation!.lat,
          startLng: fromLocation!.lng,
          startName: fromLocationName,
          destinationLat: toLocation!.lat,
          destinationLng: toLocation!.lng,
          destinationName: toLocationName,
        },
      });
      rides.push(data?.createRide!);
      setRides(rides);
      toast.success("Successfully Created Ride!");
      router.push("/dashboard/myRides");
    } catch (err) {
      toast.error("Failed to Create Ride!");
    }
  };

  const renderFormInput = () => {
    switch (formIndex) {
      case 0:
        return (
          <TripLocationInputs
            setFromLocationName={setFromLocationName}
            setToLocationName={setToLocationName}
            setFormIndex={setFormIndex}
            setFromLocation={setFromLocation}
            setToLocation={setToLocation}
            fromLocation={fromLocation}
            toLocation={toLocation}
            fromLocationName={fromLocationName}
            toLocationName={toLocationName}
          />
        );
      case 1:
        return (
          <TripSettingsInputs
            setMaxRiders={setMaxRiders}
            setFormIndex={setFormIndex}
            formIndex={formIndex}
            setVisibility={setVisibility}
            maxRiders={maxRiders}
            visibility={visibility}
            CreateRide={CreateRide}
          />
        );
    }
  };

  if (!userLocation) return <p className="p-4">Fetching user location...</p>;

  return (
    <ProtectedRoute>
      <div className="relative w-screen h-screen">
          <Map
            defaultCenter={userLocation}
            disableDefaultUI={true}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
            defaultZoom={15}
            style={{ width: "100%", height: "100%" }}
          >
            {fromLocation && <AdvancedMarker  position={fromLocation} />}
            {toLocation && <AdvancedMarker position={toLocation} />}
            {userLocation && <AdvancedMarker position={userLocation}><CircleDot className="text-blue-800 w-6 h-6" /></AdvancedMarker>}

            <FitBoundsHandler fromLocation={fromLocation} toLocation={toLocation} />
          </Map>
          {
            !!user?.currentRide 
          ?
            <OnGoingTrip
              setUserLocation={setUserLocation}
            >
            </OnGoingTrip>
          : <BottomSection
            renderFormInput={renderFormInput}
          ></BottomSection>}
      </div>
    </ProtectedRoute>
  );
}
