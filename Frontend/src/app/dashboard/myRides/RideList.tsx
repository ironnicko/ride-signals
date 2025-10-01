"use client";
import { RideState } from "@/stores/types";;

interface RidesListProps {
  rides: RideState[];
  onRideClick: (ride: RideState) => void;
}

export default function RidesList({ rides, onRideClick }: RidesListProps) {
  return (
    <div className="flex flex-col space-y-4 overflow-y-auto max-h-[90vh]">
      {rides.map((ride) => (
        <div
          key={ride.rideCode}
          className="flex cursor-pointer justify-center bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all"
          onClick={() => onRideClick(ride)}
        >
          <div className="flex flex-col">
            <div className="text-lg font-semibold text-gray-800">
              {ride.startName} <span className="text-gray-400">→</span>{" "}
              {ride.destinationName}
            </div>
            <div className="text-sm text-gray-600">
              Ride Code: <span className="font-medium">{ride.rideCode}</span>
            </div>
            <div className="text-sm text-gray-500">
              Created: {new Date(ride.createdAt!).toLocaleString()}
            </div>
            <div className="text-sm">
              Visibility:{" "}
              <span
                className={`font-medium ${
                  ride.settings!.visibility === "public"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {ride.settings!.visibility}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Participants: {ride.participants!.length} / {ride.settings!.maxRiders}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
