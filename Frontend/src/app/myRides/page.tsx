"use client";
import { useQuery } from "@apollo/client/react";
import { MY_RIDES } from "@/lib/graphql/query";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bike } from "lucide-react";
import { useState } from "react";
import RidesList from "./RideList";
import RideModal from "./RideModal";
import { RideState } from "@/stores/types";
import { useRides } from "@/stores/useRides";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MyRidesPage() {
  const router = useRouter();
  const [selectedRide, setSelectedRide] = useState<RideState | null>(null);
  const {rides, setRides} = useRides.getState();

  const { data, loading, error } = useQuery<{myRides : RideState[]}>(MY_RIDES, {
    fetchPolicy: "cache-and-network",
  });

  
  if (loading) return <p className="p-4">Loading rides...</p>;
  if (error) return <p className="p-4 text-red-600">Error loading rides: {error.message}</p>;

  setRides(data.myRides)

  
  return (
    <ProtectedRoute>
      <div className="w-full h-screen p-4 bg-gray-50">
        <div className="flex flex-row gap-5 items-center mb-4">
          <h1
            onClick={() => router.push("/dashboard")}
            className="cursor-pointer underline text-gray-600 hover:text-gray-800"
          >
                  <ArrowLeft size={18} />

          </h1>
          <h1 className="text-2xl font-bold">My Rides</h1>
        </div>

        {rides.length ? (
          <RidesList rides={rides} onRideClick={setSelectedRide} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center text-gray-500">
            <Bike className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-lg font-medium">No rides found</p>
            <p className="text-sm">Looks like you haven’t joined or created any rides yet.</p>
          </div>
        )}

        {selectedRide && (
          <RideModal ride={selectedRide}  onClose={() => {
            setSelectedRide(null);
            router.refresh();
          }} />
        )}
      </div>
    </ProtectedRoute>
  );
}
