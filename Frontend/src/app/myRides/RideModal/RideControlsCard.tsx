import { Bike, OctagonX, PenSquareIcon, Save, Share2 } from "lucide-react";
import { useState } from "react";

interface RideControlsCardProps {
  ride: any;
  user: any;
  isRideOwner: (userId?: string) => boolean;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  buttonBusy: boolean;
  handleStartRide: () => void;
  handleEndRide: () => void;
  handleSetCurrentRide: () => void;
  handleRemoveCurrentRide: () => void;
  handleSave: () => void;
}

export default function RideControlsCard({
  ride,
  user,
  isRideOwner,
  isEditing,
  setIsEditing,
  buttonBusy,
  handleStartRide,
  handleEndRide,
  handleSetCurrentRide,
  handleRemoveCurrentRide,
  handleSave,
}: RideControlsCardProps) {
  const [copied, setCopied] = useState(false);
  const owner = isRideOwner(user?.id);
  const isCurrentRide = user?.currentRide === ride.rideCode;

  const handleShareRide = () => {
    const link = `${window.location.origin}/joinRide?rideCode=${ride.rideCode}&invitedBy=${user.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const OwnerControls = () => (
    <>
      {ride.status === "not started" && (
        <ControlButton
          onClick={handleStartRide}
          busy={buttonBusy}
          color="green"
          Icon={Bike}
          label="Start Ride"
        />
      )}
      {ride.status === "started" && (
        <ControlButton
          onClick={handleEndRide}
          busy={buttonBusy}
          color="red"
          Icon={OctagonX}
          label="End Ride"
        />
      )}
      <ControlButton
        onClick={() => (isEditing ? handleSave() : setIsEditing(!isEditing))}
        color="blue"
        Icon={isEditing ? Save : PenSquareIcon}
        label={isEditing ? "Save" : "Edit"}
      />
      {!isEditing && (
        <ControlButton
          onClick={handleShareRide}
          color="purple"
          Icon={Share2}
          label={copied ? "Copied!" : "Invite"}
        />
      )}
    </>
  );

  const NonOwnerControls = () => (
    <>
      {!isCurrentRide ? (
        <ControlButton
          onClick={handleSetCurrentRide}
          color="green"
          Icon={Bike}
          label="Set Current Ride"
        />
      ) : (
        <ControlButton
          onClick={handleRemoveCurrentRide}
          color="red"
          Icon={OctagonX}
          label="Remove Current Ride"
        />
      )}
      {!isEditing && (
        <ControlButton
          onClick={handleShareRide}
          color="purple"
          Icon={Share2}
          label={copied ? "Copied!" : "Invite"}
        />
      )}
    </>
  );

  interface ControlButtonProps {
    onClick: () => void;
    busy?: boolean;
    color: "green" | "red" | "blue" | "purple";
    Icon: any;
    label: string;
  }

  const ControlButton = ({ onClick, busy, color, Icon, label }: ControlButtonProps) => {
    const colors: Record<string, string> = {
      green: "text-green-600 hover:text-green-800",
      red: "text-red-600 hover:text-red-800",
      blue: "text-blue-600 hover:text-blue-800",
      purple: "text-purple-600 hover:text-purple-800",
    };
    return (
      <button
        onClick={onClick}
        disabled={busy}
        className={`flex flex-col items-center cursor-pointer transition-all ${colors[color]}`}
      >
        <Icon size={28} />
        <span className="text-xs mt-1">{label}</span>
      </button>
    );
  };

  return (
    <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md rounded-xl p-6 flex flex-wrap justify-center gap-6 shadow-lg border border-white/20">
      {owner ? <OwnerControls /> : <NonOwnerControls />}
    </div>
  );
}
