import { Profile } from "@/components/Profile";
import Timer from "@/components/Timer";
import { UPDATE_RIDE } from "@/lib/graphql/mutation";
import { RIDE } from "@/lib/graphql/query";
import { GeoLocation, RideState } from "@/stores/types";
import { useAuth } from "@/stores/useAuth";
import { useMutation, useQuery } from "@apollo/client/react";
import { Fuel, Square, ArrowLeft, ArrowRight, RefreshCcw, OctagonX } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";

interface OnGoingTripProps{
  setUserLocation: Dispatch<SetStateAction<GeoLocation | null>>
}

export const OnGoingTrip = ({setUserLocation} : OnGoingTripProps) => {
  const { user, setUser } = useAuth.getState();
  const router = useRouter();
  const [updateRide] = useMutation(UPDATE_RIDE);
  const { data, loading, error } = useQuery<{ ride: RideState }>(RIDE, {
    variables: { rideCode: user?.currentRide! },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        console.log("Fetching Location...")
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (loading) return <p className="p-4">Loading Current Trip...</p>;
  if (error) return <p className="p-4 text-red-600">Error loading Current Trip: {error.message}</p>;


  const handleSave = async (newRide : {status : string, endedAt: string}) => {
    try {
      await updateRide({
        variables: {
          rideCode: data!.ride.rideCode,
          ...newRide,
        },
      });
      if (user?.currentRide === data!.ride.rideCode){
        user.currentRide = null
        setUser(user);
      }
      toast.success("Ride updated!");
      router.refresh();
    } catch (err) {
      toast.error("Failed to update ride");
      console.error(err);
    }
  };

  const handleEndRide = async () => {
    const now = new Date();
    const isoString = now.toISOString();

    await handleSave({status : "ended", endedAt : isoString});
  }


  return (
    <>
      <Profile className="absolute top-4 left-[12vw] flex flex-col items-center" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <Timer ride={data?.ride!}></Timer>
        <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 w-80">
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {/* End Ride */}
            <button onClick={handleEndRide} className="flex flex-col cursor-pointer items-center text-red-600 hover:text-red-800">
              <OctagonX className="w-7 h-7" />
              <span className="text-xs mt-1">End Ride</span>
            </button>

            {/* Refuel */}
            <button className="flex flex-col items-center text-blue-600 hover:text-blue-800">
              <Fuel className="w-7 h-7" />
              <span className="text-xs mt-1">Refuel</span>
            </button>

            {/* Stop */}
            <button className="flex flex-col items-center text-gray-700 hover:text-black">
              <Square className="w-7 h-7" />
              <span className="text-xs mt-1">Stop</span>
            </button>

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
            <button className="flex flex-col items-center text-green-600 hover:text-green-800">
              <ArrowRight className="w-7 h-7" />
              <span className="text-xs mt-1">Right</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
