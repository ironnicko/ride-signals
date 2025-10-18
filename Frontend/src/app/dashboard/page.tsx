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
import { useOtherUsers } from "@/stores/useOtherUsers";
import PushNotificationManager from "@/components/PushNotificationManager";

function hashStringToHsl(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { users: otherUsers } = useOtherUsers();

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    formIndex: 0,
    toLocation: null,
    fromLocation: null,
    userLocation: null,
    toLocationName: null,
    fromLocationName: null,
    maxRiders: 5,
    visibility: "private",
    tripName: null,
  });

  const { toLocation, fromLocation, userLocation } = dashboardState;

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
      { enableHighAccuracy: true },
    );
  }, []);

  const updateDashboard = (updates: Partial<DashboardState>) =>
    setDashboardState((prev) => ({ ...prev, ...updates }));

  if (!userLocation)
    return (
      <ProtectedRoute>
        <p className="p-4">Fetching user location...</p>
      </ProtectedRoute>
    );

  return (
    <ProtectedRoute>
      <div className="relative w-screen h-screen overflow-hidden">
        <PushNotificationManager />
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

          {Object.entries(otherUsers).map(([id, u]) => {
            if (id === user?.id) return null;
            if (!u.location) return null;
          
            const { lat, lng } = u.location;
          
            const userColor = hashStringToHsl(id);
          
            return (
              <AdvancedMarker key={id} position={{ lat, lng }}>
                <div
                  className="relative flex items-center justify-center rounded-full w-8 h-8 font-semibold text-white text-xs"
                  style={{ backgroundColor: userColor }}
                >
                  <CircleDot className="absolute inset-0 w-full h-full text-white opacity-25" />
                  <span className="z-10 truncate max-w-[1.5rem] text-center">
                    {u.name?.substring(0, 2) || "?"}
                  </span>
                </div>
              </AdvancedMarker>
            );
          })}


          <FitBoundsHandler
            fromLocation={userLocation}
            toLocation={toLocation}
            otherUsers={otherUsers}
          />
        </Map>

        {!!user?.currentRide ? (
          <OnGoingTrip
            updateDashboard={updateDashboard}
            dashboardState={dashboardState}
          />
        ) : (
          <BottomSection
            updateDashboard={updateDashboard}
            dashboardState={dashboardState}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
