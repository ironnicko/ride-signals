import { useEffect } from "react";
import { UserRound } from "lucide-react";
import { useOtherUsers } from "@/stores/useOtherUsers";
import { RideState } from "@/stores/types";

export default function ParticipantsList({ ride }: { ride: RideState }) {
  const { fetchUsersByIds, getUserById } = useOtherUsers();

  useEffect(() => {
    if (ride.participants) {
      const userIds = ride.participants.map((p) => p.userId);
      fetchUsersByIds(userIds);
    }
  }, [ride.participants]);

  return (
    <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
      <div className="flex flex-wrap justify-center gap-6">
        {ride.participants?.map((p) => {
          const user = getUserById(p.userId);
          return (
            <div
              key={p.userId}
              className="flex flex-col items-center text-center space-y-2"
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name ?? "User"}
                  className="w-16 h-16 rounded-full border border-gray-300 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserRound className="text-gray-500 w-8 h-8" />
                </div>
              )}
              <p className="text-sm font-medium">{user?.name ?? "Unknown"}</p>
              <p className="text-xs text-gray-500">{p.role}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
