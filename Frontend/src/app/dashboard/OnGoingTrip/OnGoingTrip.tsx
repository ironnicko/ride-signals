import { Profile } from "@/components/Profile";
import Timer from "@/components/Timer";
import { RIDE } from "@/lib/graphql/query";
import { DashboardState, RideState } from "@/stores/types";
import { useAuth } from "@/stores/useAuth";
import { useSocket } from "@/stores/useSocket";
import { useQuery } from "@apollo/client/react";
import {
  Fuel,
  Square,
  ArrowLeft,
  ArrowRight,
  RefreshCcw,
  PlusCircle,
} from "lucide-react";
import { useEffect } from "react";

interface OnGoingTripProps {
  updateDashboard: (updates: Partial<DashboardState>) => void;
}

export const OnGoingTrip = ({ updateDashboard }: OnGoingTripProps) => {
  const { user } = useAuth();
  const { joinRide, sendLocation } = useSocket();
  const { data, loading, error } = useQuery<{ ride: RideState }>(RIDE, {
    variables: { rideCode: user.currentRide },
    fetchPolicy: "cache-and-network",
  });

  // useEffect(() => {
  //   const watchId = navigator.geolocation.watchPosition(
  //     (pos) => {
  //       const location = {
  //         lat: pos.coords.latitude,
  //         lng: pos.coords.longitude,
  //       };
  //       updateDashboard({
  //         userLocation: location,
  //       });
  //       if (data?.ride?.rideCode) { 
  //         sendLocation({rideCode : data.ride.rideCode, location})
  //       }
  //       console.log("Fetching Location...");
  //     },
  //     (err) => console.error(err),
  //     { enableHighAccuracy: true, maximumAge: 0 },
  //   );
  //   return () => navigator.geolocation.clearWatch(watchId);
  // }, []);
  
  useEffect(() => {
    if (!data?.ride?.rideCode) return;
  
    const { rideCode } = data.ride;
  
    // Fetch and send location every 5 seconds
    const fetchLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
  
          updateDashboard({ userLocation: location });
          sendLocation({ rideCode, location });
  
          console.log("📍 Location sent:", location);
        },
        (err) => console.error("❌ Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    };
  
    // Immediately fetch once
    fetchLocation();
  
    // Start interval for every 5 seconds
    const intervalId = setInterval(fetchLocation, 5000);
  
    return () => clearInterval(intervalId);
  }, [data?.ride?.rideCode]);

  
  useEffect(() => {
    if (data?.ride?.rideCode) {
      joinRide({ rideCode: data.ride.rideCode });
    }
  }, [data?.ride?.rideCode, joinRide]);


  if (loading) return <p className="p-4">Loading Current Trip...</p>;
  if (error)
    return (
      <p className="p-4 text-red-600">
        Error loading Current Trip: {error.message}
      </p>
    );

  return (
    <>
      <Profile className="absolute top-4 left-[12vw] flex flex-col items-center" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <Timer ride={data.ride}></Timer>
        <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 w-80">
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {/* Left Arrow */}
            <button className="flex flex-col items-center text-green-600 hover:text-green-800">
              <ArrowLeft className="w-7 h-7" />
              <span className="text-xs mt-1">Left</span>
            </button>

            {/* U-Turn */}
            <button className="flex flex-col items-center text-purple-600 hover:text-purple-800">
              <RefreshCcw className="w-7 h-7" />
              <span className="text-xs mt-1">U-Turn</span>
            </button>

            {/* Right Arrow */}
            <button className="flex flex-col items-center text-red-600 hover:text-red-800">
              <ArrowRight className="w-7 h-7" />
              <span className="text-xs mt-1">Right</span>
            </button>

            {/* Refuel */}
            <button className="flex flex-col items-center text-blue-600 hover:text-blue-800">
              <Fuel className="w-7 h-7" />
              <span className="text-xs mt-1">Refuel</span>
            </button>

            {/* Stop */}
            <button className="flex flex-col items-center text-gray-600 hover:text-black">
              <Square className="w-7 h-7" />
              <span className="text-xs mt-1">Stop</span>
            </button>

            {/* Custom */}
            <button className="flex flex-col items-center text-yellow-600 hover:text-yellow-800">
              <PlusCircle className="w-7 h-7" />
              <span className="text-xs mt-1">Custom</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
