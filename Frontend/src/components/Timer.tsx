import { RideState } from "@/stores/types";
import { useEffect, useState } from "react";

interface TimerProps{
    ride : RideState
}

export default function Timer({ride} : TimerProps) {
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    if (!ride?.startedAt) return;

    const start = new Date(ride.startedAt).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      const hrs = String(Math.floor(diff / 3600)).padStart(2, "0");
      const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const secs = String(diff % 60).padStart(2, "0");
      setElapsed(`${hrs}:${mins}:${secs}`);
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [ride?.startedAt]);

  return (
    <div className="px-4 py-2 bg-black text-white rounded-lg shadow-md font-mono">
        {elapsed}
    </div>
  );
}
