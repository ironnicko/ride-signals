"use client";
import { DashboardState, RideState } from "@/stores/types";;
import { UPDATE_RIDE } from "@/lib/graphql/mutation";
import { OctagonX, X, PenSquareIcon, Bike, Save } from "lucide-react";
import { useAuth } from "@/stores/useAuth";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useRides } from "@/stores/useRides";
import { useRouter } from "next/navigation";
import { EmbedMap } from "@/components/EmbedMap";


interface RideModalProps {
  ride: RideState;
  onClose: () => void;
}

interface UpdateRideParams{
  endedAt : string
  startedAt: string
  status: "ended" | "started" | "not started"| null
  visibility: "private" | "public",
  maxRiders: number,
}



export default function RideModal({ ride, onClose }: RideModalProps) {
  const { user, setUser } = useAuth.getState();
  const { replaceRide } = useRides.getState();
  const [isEditing, setIsEditing] = useState(false);
  const [currentRide, setCurrentRide] = useState(ride);
  const [formState, setFormState] = useState<Partial<UpdateRideParams>>({
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

  const handleSave = async (newRide : Partial<UpdateRideParams> | null) => {
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
                  className="border rounded p-1/2"
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
              {(isEditing && !currentRide.endedAt) ? (
                <input
                  type="number"
                  className="w-16 border rounded p-1/2"
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
                {currentRide.status}
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
              <div className="flex justify-center gap-14 mt-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => handleSave(null)}
                        className="flex flex-col items-center cursor-pointer text-blue-600 hover:text-blue-800"
                      >
                        <Save />
                        <span className="text-xs mt-1">Save</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                        className="flex flex-col items-center cursor-pointer text-gray-600 hover:text-gray-800"
                      >
                        <X />
                        <span className="text-xs mt-1">Cancel</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Conditional buttons */}
                    {currentRide.status === "not started" && (
                      <button
                        onClick={handleStartRide}
                        className="flex flex-col items-center cursor-pointer text-green-600 hover:text-green-800"
                      >
                        <Bike />
                        <span className="text-xs mt-1">Start Ride</span>
                      </button>
                    )}

                    {currentRide.status === "started" && (
                      <button
                        onClick={handleEndRide}
                        className="flex flex-col items-center cursor-pointer text-red-600 hover:text-red-800"
                      >
                        <OctagonX />
                        <span className="text-xs mt-1">End Ride</span>
                      </button>
                    )}

                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex flex-col items-center cursor-pointer text-blue-600 hover:text-blue-800"
                    >
                      <PenSquareIcon />
                      <span className="text-xs mt-1">Edit Ride</span>
                    </button>
                  </>
                )}
              </div>
            )}

          </div>

          {/* Map */}
          <div className="w-full h-64 rounded-lg overflow-hidden">
          <EmbedMap start={currentRide.start!} destination={currentRide.destination!} />
          </div>
        </div>
      </div>
    </div>
  );
}
