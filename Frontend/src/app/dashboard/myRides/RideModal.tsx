"use client";
import { RideState } from "@/stores/types";;
import { UPDATE_RIDE } from "@/lib/graphql/mutation";
import { X } from "lucide-react";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useAuth } from "@/stores/useAuth";
import { FitBoundsHandler } from "@/components/FitBoundsHelper";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useRides } from "@/stores/useRides";
import { useRouter } from "next/navigation";

interface RideModalProps {
  ride: RideState;
  onClose: () => void;
}

interface UpdateRideParams{
    visibility: string | null,
    maxRiders: number | null,
    endedAt: string | null,
    startedAt: string | null,
    status: "ended" | "started" | "not started"| null,

}

export default function RideModal({ ride, onClose }: RideModalProps) {
  const { user, setUser } = useAuth.getState();
  const { replaceRide } = useRides.getState();
  const [isEditing, setIsEditing] = useState(false);
  const [currentRide, setCurrentRide] = useState(ride);
  const [formState, setFormState] = useState<UpdateRideParams>({
    visibility: ride.settings!.visibility,
    maxRiders: ride.settings!.maxRiders,
    endedAt: ride.endedAt!,
    startedAt: ride.startedAt!,
    status: ride.status,
  });
  const router = useRouter();

  const [updateRide] = useMutation(UPDATE_RIDE);

  const isRideOwner = (userId: string) => {
    return currentRide.participants!.some(
      (p) => p.userId === userId && p.role === "leader"
    );
  };

  const handleSave = async (newRide : UpdateRideParams | null) => {
    try {
      const replaceData = !!newRide ? newRide : formState
      const { data } = await updateRide({
        variables: {
          rideCode: currentRide.rideCode,
          ...replaceData,
        },
      });
      // @ts-ignore
      const updatedRide = data.updateRide;
      setCurrentRide(updatedRide);
      replaceRide(updatedRide);
      toast.success("Ride updated!");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update ride");
      console.error(err);
    }
  };

  const handleEndRide = async () => {
    const now = new Date();
    const isoString = now.toISOString();
    formState.status = "ended"
    formState.endedAt = isoString

    if (user?.currentRide === ride.rideCode){
      user.currentRide = null
      setUser(user);
    }

    await handleSave(formState);
  }

  const handleStartRide = async () => {
    const now = new Date();
    const isoString = now.toISOString();
    formState.status = "started"
    formState.startedAt = isoString
    user!.currentRide = ride.rideCode
    setUser(user!);
    await handleSave(formState);
    router.push("/dashboard")
  }
  
  return (
    <div className="fixed inset-0 bg-gray-200/[.75] flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[90vw] max-w-3xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <h2 className="text-2xl font-bold mb-4">
          <>
            {currentRide.startName} → {currentRide.destinationName}
          </>
        </h2>

        <div className="grid grid-cols-2 items-start gap-6">
          {/* Ride Info */}
          <div className="space-y-2">
            <p>
              <span className="font-medium">Ride Code:</span>{" "}
              {currentRide.rideCode}
            </p>
            <p>
              <span className="font-medium">Created:</span>{" "}
              {new Date(currentRide.createdAt!).toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Visibility:</span>{" "}
              {isEditing ? (
                <select
                  className="border rounded p-1"
                  value={formState.visibility!}
                  onChange={(e) =>
                    setFormState((s) => ({
                      ...s,
                      visibility: e.target.value as "public" | "private",
                    }))
                  }
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
                </select>
              ) : (
                currentRide.settings!.visibility
              )}
            </p>
            <p>
              <span className="font-medium">Participants:</span>{" "}
              {currentRide.participants!.length} /{" "}
              {isEditing ? (
                <input
                  type="number"
                  className="w-16 border rounded p-1"
                  value={formState.maxRiders!}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, maxRiders: +e.target.value }))
                  }
                />
              ) : (
                currentRide.settings!.maxRiders
              )}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              {isEditing ? (
                <select
                  className="border rounded p-1"
                  value={formState.status as string}
                  onChange={(e) =>
                    setFormState((s) => ({
                      ...s,
                      status: e.target.value as RideState["status"],
                    }))
                  }
                >
                  <option value="not started">not started</option>
                  <option value="started">started</option>
                  <option value="ended">ended</option>
                </select>
              ) : (
                currentRide.status
              )}
            </p>
            <p>
              <span className="font-medium">Ended At:</span>{" "}
              {currentRide.endedAt ? (
                new Date(currentRide.endedAt).toLocaleString()
              ) : (
                "-"
              )}
            </p>
            {/* Edit Options if owner */}
            {isRideOwner(user?.id!) && (
              <div className="flex justify-center gap-3 pt-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => handleSave(null)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-300 text-white rounded-lg hover:bg-gray-400 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {/* Conditional buttons */}
                    {currentRide.status === "not started" && (
                      <button
                        onClick={handleStartRide}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                      >
                        Start Ride
                      </button>
                    )}

                    {currentRide.status === "started" && (
                      <button
                        onClick={handleEndRide}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                      >
                        End Ride
                      </button>
                    )}

                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Edit Ride
                    </button>
                  </>
                )}
              </div>
            )}

          </div>

          {/* Map */}
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <Map
              mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
              disableDefaultUI={true}
              scrollwheel={false}
              keyboardShortcuts={false}
              disableDoubleClickZoom={true}
              style={{ width: "100%", height: "100%" }}
              zoomControl={false}
              gestureHandling='none'
              clickableIcons={false}
            >
              <AdvancedMarker position={currentRide.start} />
              <AdvancedMarker position={currentRide.destination} />
              <FitBoundsHandler
                fromLocation={currentRide.start}
                toLocation={currentRide.destination}
              />
            </Map>
          </div>
        </div>
      </div>
    </div>
  );
}
