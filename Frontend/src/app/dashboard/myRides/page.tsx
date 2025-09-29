"use client";
import { useQuery } from "@apollo/client/react";
import { MY_RIDES, Ride } from "@/lib/graphql/query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bike } from "lucide-react"; // you can swap the icon

export default function MyRides() {
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const router = useRouter();

  
  const { data, loading, error } = useQuery(MY_RIDES, {
    fetchPolicy: "cache-and-network"
  });

  if (loading) return <p className="p-4">Loading rides...</p>;
  if (error) return <p className="p-4 text-red-600">Error loading rides: {error.message}</p>;

  // @ts-ignore
  const rides: Ride[] = data?.myRides ?? [];

  return (
    <div className="w-full h-screen p-4 bg-gray-50">
      <div className="flex flex-row gap-5 items-center mb-4">
        <h1
          onClick={() => router.back()}
          className="cursor-pointer underline text-gray-600 hover:text-gray-800"
        >
          Back
        </h1>
        <h1 className="text-2xl font-bold">My Rides</h1>
      </div>

      {/* Ride list */}
      <div className="flex flex-col space-y-4 overflow-y-auto max-h-[90vh]">
        {rides.length ? (
          rides.map((ride) => (
            <div
              key={ride.id}
              className="flex cursor-pointer justify-center bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all"
            >
              {/* Ride Info */}
              <div className="flex flex-col">
                <div className="text-lg font-semibold text-gray-800">
                  {ride.startName} <span className="text-gray-400">→</span>{" "}
                  {ride.destinationName}
                </div>
                <div className="text-sm text-gray-600">
                  Ride Code: <span className="font-medium">{ride.rideCode}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Created: {new Date(ride.createdAt).toLocaleString()}
                </div>
                <div className="text-sm">
                  Visibility:{" "}
                  <span
                    className={`font-medium ${
                      ride.settings.visibility === "Public"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {ride.settings.visibility}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Participants: {ride.participants.length} /{" "}
                  {ride.settings.maxRiders}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center text-gray-500">
            <Bike className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-lg font-medium">No rides found</p>
            <p className="text-sm">Looks like you haven’t joined or created any rides yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
