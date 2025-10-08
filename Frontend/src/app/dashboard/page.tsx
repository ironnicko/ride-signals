"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { FitBoundsHandler } from "@/components/FitBoundsHelper";
import { DashboardState } from "@/stores/types";
import BottomSection from "./CreateTrip/BottomSection";
import { useAuth } from "@/stores/useAuth";
import { OnGoingTrip } from "./OnGoingTrip/OnGoingTrip";
import { CircleDot } from "lucide-react";


export default function DashboardPage() {
  
  const { user } = useAuth();

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    formIndex: 0,
    toLocation: null,
    fromLocation: null,
    userLocation: null,
    toLocationName: null,
    fromLocationName: null,
    maxRiders: 5,
    visibility: "private",
    tripName : null
  });

  const {
    toLocation,
    fromLocation,
    userLocation,
  } = dashboardState;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
    (pos) =>
      setDashboardState((prev) => ({
        ...prev,
        userLocation: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        },
      })),
    (err) => console.error(err),
    { enableHighAccuracy: true }
  );
  }, []);

  const updateDashboard = (updates: Partial<DashboardState>) =>
    setDashboardState((prev) => ({ ...prev, ...updates }));


  if (!userLocation) return <ProtectedRoute><p className="p-4">Fetching user location...</p></ProtectedRoute>;

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
          {fromLocation && <AdvancedMarker position={fromLocation} />}
          {toLocation && <AdvancedMarker position={toLocation} />}
          {userLocation && (
            <AdvancedMarker position={userLocation}>
              <CircleDot className="text-blue-800 w-8 h-8" />
            </AdvancedMarker>
          )}

          <FitBoundsHandler fromLocation={fromLocation} toLocation={toLocation} />
        </Map>

        {!!user?.currentRide ? (
          <OnGoingTrip  updateDashboard={updateDashboard}/>
        ) : (
          <BottomSection updateDashboard={updateDashboard} dashboardState={dashboardState} />
        )}
      </div>
    </ProtectedRoute>
  );
}
