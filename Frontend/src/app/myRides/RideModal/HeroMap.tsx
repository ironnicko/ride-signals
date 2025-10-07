import { X } from "lucide-react";
import { EmbedMap } from "@/components/EmbedMap";
import { RideState } from "@/stores/types";
import { UpdateRideParams } from "./RideModal";

export default function HeroMap({
  ride,
  onClose,
  formState,
}: {
  ride: RideState;
  onClose: () => void;
  formState: Partial<UpdateRideParams>;
}) {
  return (
    <div className="relative w-full h-[40vh] rounded-b-2xl overflow-hidden">
      <EmbedMap start={ride.start!} destination={ride.destination!} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-8 text-white">
        <h2 className="text-3xl font-bold">
          {formState.tripName || `${ride.startName} → ${ride.destinationName}`}
        </h2>
        <p className="opacity-80 text-sm mt-2">
          {ride.status === "not started"
            ? "Not started yet"
            : ride.status === "started"
            ? "In progress 🚴‍♂️"
            : "Ended"}
        </p>
      </div>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 bg-white/30 hover:bg-white/40 text-white p-2 rounded-full"
      >
        <X />
      </button>
    </div>
  );
}
