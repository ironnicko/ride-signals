"use client";
import { Ride } from "@/lib/graphql/query";
// import { UPDATE_RIDE } from "@/lib/graphql/mutation";
import { X } from "lucide-react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useAuth } from "@/stores/useAuth";
import { FitBoundsHandler } from "@/components/FitBoundsHelper";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";

interface RideModalProps {
  ride: Ride;
  onClose: () => void;
}

export default function RideModal({ ride, onClose }: RideModalProps) {
  const { user } = useAuth.getState();
  const [isEditing, setIsEditing] = useState(false);

  const [formState, setFormState] = useState({
    visibility: ride.settings.visibility,
    maxRiders: ride.settings.maxRiders,
  });

  // const [updateRide] = useMutation(UPDATE_RIDE);

function isRideOwner(ride: Ride, userId: string): boolean {
  return ride.participants.some(
    (p) => {
      console.log(p, userId)
      return p.userId === userId && p.role === "leader"
    }
  );
}


  // const handleSave = async () => {
  //   try {
  //     await updateRide({
  //       variables: {
  //         id: ride.id,
  //         ...formState,
  //       },
  //     });
  //     toast.success("Ride updated!");
  //     setIsEditing(false);
  //   } catch (err) {
  //     toast.error("Failed to update ride");
  //     console.error(err);
  //   }
  // };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[90vw] max-w-3xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <h2 className="text-2xl font-bold mb-4">
            <>
              {ride.startName} → {ride.destinationName}
            </>
        </h2>

        <div className="grid grid-cols-2 items-start gap-6">
          {/* Ride Info */}
          <div className="space-y-2">
            <p>
              <span className="font-medium">Ride Code:</span> {ride.rideCode}
            </p>
            <p>
              <span className="font-medium">Created:</span>{" "}
              {new Date(ride.createdAt).toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Visibility:</span>{" "}
              {isEditing ? (
                <select
                  className="border rounded p-1"
                  value={formState.visibility}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, visibility: e.target.value as "public" | "private" }))
                  }
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
                </select>
              ) : (
                ride.settings.visibility
              )}
            </p>
            <p>
              <span className="font-medium">Participants:</span>{" "}
              {ride.participants.length} /{" "}
              {isEditing ? (
                <input
                  type="number"
                  className="w-16 border rounded p-1"
                  value={formState.maxRiders}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, maxRiders: +e.target.value }))
                  }
                />
              ) : (
                ride.settings.maxRiders
              )}
            </p>
          {/* Edit Options if owner */}
          {isRideOwner(ride, user?.id!) && (
            <div className="flex justify-center gap-3">
              {isEditing ? (
                <>
                  <button
                    // onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-300 text-white rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Ride
                </button>
              )}
            </div>
          )}
          </div>

          {/* Map */}
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <APIProvider
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
            >
              <Map
                mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
                disableDefaultUI={true}
                scrollwheel={false}
                keyboardShortcuts={false}
                disableDoubleClickZoom={true}
                draggable={false}
                style={{ width: "100%", height: "100%" }}
              >
                <AdvancedMarker position={ride.start} />
                <AdvancedMarker position={ride.destination} />
                <FitBoundsHandler
                  fromLocation={ride.start}
                  toLocation={ride.destination}
                />
              </Map>
            </APIProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
