"use client";
import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_RIDE, GeoLocation } from "@/lib/graphql/mutation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { TripLocationInputs } from "./TripLocationInputs";
import { TripSettingsInputs } from "./TripSettingsInputs";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/stores/useAuth";


interface FitBoundsHandlerProps {
  fromLocation: google.maps.LatLngLiteral | null;
  toLocation: google.maps.LatLngLiteral | null;
}

const FitBoundsHandler = ({ fromLocation, toLocation }: FitBoundsHandlerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !fromLocation) return;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(fromLocation);

    if (toLocation) {
      bounds.extend(toLocation);
    }

    map.fitBounds(bounds);
  }, [map, fromLocation, toLocation]);

  return null;
};

export default function DashboardPage() {
  const [createRide] = useMutation(CREATE_RIDE);
  const [formIndex, setFormIndex] = useState<number>(0);
  const [toLocation, setToLocation] = useState<GeoLocation | null>(null);
  const [fromLocation, setFromLocation] = useState<GeoLocation | null>(null);
  const [toLocationName, setToLocationName] = useState<string | null>(null);
  const [fromLocationName, setFromLocationName] = useState<string | null>(null);
  const [maxRiders, setMaxRiders] = useState<number>(1);
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [toMarkerRef] = useAdvancedMarkerRef();
  const [fromMarkerRef] = useAdvancedMarkerRef();
  const {user} = useAuth.getState();
  const router = useRouter();

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

  const CreateRide = async () => {
    try {
      await createRide({
        variables: {
          maxRiders,
          visibility,
          startLat: fromLocation!.lat,
          startLng: fromLocation!.lng,
          startName : fromLocationName,
          destinationLat: toLocation!.lat,
          destinationLng: toLocation!.lng,
          destinationName : toLocationName,
        },
      });
      toast.success("Successfully Created Ride!");
      router.push("/dashboard/myRides")
    } catch (err) {
      toast.error("Failed to Create Ride!");
      // Handle Error!
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
          />
        );
      case 1:
        return (
          <TripSettingsInputs
            setMaxRiders={setMaxRiders}
            setVisibility={setVisibility}
            maxRiders={maxRiders}
            visibility={visibility}
            CreateRide={CreateRide}
          />
        );
    }
  };

  if (!fromLocation)
    return <p className="p-4">Fetching current location...</p>;

  return (
    <ProtectedRoute>
      <div className="relative w-screen h-screen">
        {/* Wrap in APIProvider */}
        <APIProvider 
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
        solutionChannel='GMP_devsite_samples_v3_rgmautocomplete'
        libraries={["places"]}
        >
          <Map
            defaultCenter={fromLocation}
            defaultZoom={8}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
            style={{ width: "100%", height: "100%" }}
          >
            {/* From marker */}
            {fromLocation && <AdvancedMarker ref={fromMarkerRef} position={fromLocation} />}
            {/* To marker */}
            {toLocation && <AdvancedMarker ref={toMarkerRef} position={toLocation} />}
            <FitBoundsHandler fromLocation={fromLocation} toLocation={toLocation} />
          </Map>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="relative top-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer">
              <Image
                src={(user?.picture ? user?.picture:"/user.svg")}
                alt="Profile"
                width={48}
                height={48}
                className="object-cover"
                onClick={()=>router.push("/dashboard/myRides")}
              />
            </div>
          </div>
          <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 w-80">
            {renderFormInput()}
          </div>
        </div>
        </APIProvider>
      </div>
    </ProtectedRoute>
  );
}
