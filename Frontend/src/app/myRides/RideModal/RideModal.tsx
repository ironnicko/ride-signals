"use client";
import { useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { RideState } from "@/stores/types";
import { UPDATE_RIDE } from "@/lib/graphql/mutation";
import { useAuth } from "@/stores/useAuth";
import { useRides } from "@/stores/useRides";
import RideInfoCard from "./RideInfoCard";
import RideControlsCard from "./RideControlsCard";
import HeroMap from "./HeroMap";
import ParticipantsList from "./ParticipantsList";

export interface UpdateRideParams {
  endedAt: string;
  startedAt: string;
  status: "ended" | "started" | "not started" | null;
  visibility: "private" | "public";
  maxRiders: number;
  requestType: "start" | "end" | "remove" | null;
  tripName: string;
}

interface RideModalProps {
  ride: RideState;
  onClose: (changed: boolean) => void;
}

export default function RideModal({ ride, onClose }: RideModalProps) {
  const { user, setUser } = useAuth.getState();
  const { replaceRide } = useRides.getState();
  const [currentRide, setCurrentRide] = useState(ride);
  const [formState, setFormState] = useState<Partial<UpdateRideParams>>({
    visibility: ride.settings.visibility,
    maxRiders: ride.settings.maxRiders,
    endedAt: ride.endedAt,
    startedAt: ride.startedAt,
    status: ride.status,
    tripName: ride.tripName,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [buttonBusy, setButtonBusy] = useState(false);
  const didEdit = useRef(false);
  const router = useRouter();
  const [updateRide] = useMutation<{updateRide : RideState}>(UPDATE_RIDE);

  const isRideOwner = (id: string) =>
    currentRide.participants?.some((p) => p.userId === id && p.role === "leader");

  async function handleRideChange(
    newStatus: "started" | "ended" | null,
    requestType?: "start" | "end" | "remove"
  ) {
    setButtonBusy(true);
    try {
      const now = new Date().toISOString();
      const updates: Partial<UpdateRideParams> = {
        ...formState,
        status: newStatus,
        startedAt: newStatus === "started" ? now : formState.startedAt,
        endedAt: newStatus === "ended" ? now : formState.endedAt,
        requestType: requestType ?? null,
      };

      const { data } = await updateRide({
        variables: { rideCode: currentRide.rideCode, ...updates },
      });
      const updatedRide = data.updateRide;
      setCurrentRide(updatedRide);
      replaceRide(updatedRide);
      didEdit.current = true;

      if (newStatus === "started") {
        setUser({ ...user!, currentRide: ride.rideCode });
        router.push("/dashboard");
        toast.success("Ride started!");
      } else if (newStatus === "ended") {
        setUser({ ...user!, currentRide: null });
        toast.success("Ride ended!");
      } else {
        toast.success("Ride updated!");
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Ride update failed");
    }
    setButtonBusy(false);
  }

  const handleStartRide = () => handleRideChange("started");
  const handleEndRide = () => handleRideChange("ended");
  const handleSetCurrentRide = async () => {
    setUser({ ...user!, currentRide: currentRide.rideCode });
    await handleRideChange(null, "start");
    router.push("/dashboard");
  };
  const handleRemoveCurrentRide = async () => {
    setUser({ ...user!, currentRide: null });
    await handleRideChange(null, "remove");
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex flex-col overflow-y-auto">
      <HeroMap
        ride={currentRide}
        onClose={() => onClose(didEdit.current)}
        formState={formState}
      />
      <div className="flex flex-col items-center gap-6 px-6 mt-6 pb-10">
        <RideInfoCard
          ride={currentRide}
          formState={formState}
          isEditing={isEditing}
          onChange={setFormState}
        />
        <RideControlsCard
          ride={currentRide}
          user={user}
          isRideOwner={isRideOwner}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          buttonBusy={buttonBusy}
          handleStartRide={handleStartRide}
          handleEndRide={handleEndRide}
          handleSetCurrentRide={handleSetCurrentRide}
          handleRemoveCurrentRide={handleRemoveCurrentRide}
          handleSave={() => handleRideChange(null)}
        />
        <ParticipantsList
          ride={currentRide}
        ></ParticipantsList>
      </div>
    </div>
  );
}
