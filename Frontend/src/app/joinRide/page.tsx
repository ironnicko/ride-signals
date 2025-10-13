"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { RIDE } from "@/lib/graphql/query";
import { JOIN_RIDE } from "@/lib/graphql/mutation";
import { RideState, UserState } from "@/stores/types";
import { useAuth } from "@/stores/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { gql } from "@apollo/client";
import { useOtherUsers } from "@/stores/useOtherUsers";

export default function JoinRidePage() {
  const params = useSearchParams();
  const rideCode = params.get("rideCode");
  const [invitedBy, setInvitiedBy] = useState<string | null>(
    params.get("invitedBy"),
  );
  const { user } = useAuth();
  const router = useRouter();
  const { data, loading, error } = useQuery<{ ride: RideState }>(RIDE, {
    variables: { rideCode: rideCode || "" },
    skip: !rideCode,
  });

  const { getUserById, fetchUsersByIds } = useOtherUsers();

  const [joinRide, { loading: joining }] = useMutation<{ joinRide: RideState }>(
    JOIN_RIDE,
  );
  const [joined, setJoined] = useState(false);

  fetchUsersByIds([invitedBy]);

  useEffect(() => {
    if (!data?.ride || !user) return;
    const alreadyJoined = data.ride.participants.some(
      (participant) => participant.userId === user.id,
    );

    if (
      !data.ride.participants.some(
        (participant) => participant.userId == invitedBy,
      )
    )
      setInvitiedBy(null);

    setJoined(alreadyJoined);
  }, [data, user]);

  const handleJoin = async () => {
    if (!rideCode) return;
    if (joined) router.push("/myRides");
    try {
      await joinRide({ variables: { rideCode, role: "member" } });
      setJoined(true);
      router.push("/myRides");
    } catch (err) {
      console.error(err);
    }
  };

  if (!rideCode)
    return (
      <ProtectedRoute>
        <p className="text-center mt-10">No ride code provided.</p>
      </ProtectedRoute>
    );
  if (!invitedBy)
    return (
      <ProtectedRoute>
        <p className="text-center mt-10">
          You must be invited by someone to join.
        </p>
      </ProtectedRoute>
    );
  if (loading)
    return (
      <ProtectedRoute>
        <p className="text-center mt-10">Loading ride details...</p>
      </ProtectedRoute>
    );
  if (error)
    return (
      <ProtectedRoute>
        <p className="text-center mt-10 text-red-500">Error: {error.message}</p>
      </ProtectedRoute>
    );

  const ride = data?.ride;
  const participantCount = ride?.participants?.length ?? 0;
  const inviterName = getUserById(invitedBy)?.name || "Someone";

  if (participantCount == ride.settings.maxRiders && !joined)
    return (
      <ProtectedRoute>
        <p className="text-center mt-10">Sorry This Trip is Full!</p>
      </ProtectedRoute>
    );

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
          {/* Header */}
          <div className="mb-3 text-center">
            <h2 className="flex flex-row gap-4 text-2xl font-bold items-center justify-center">
              Join Ride
            </h2>
          </div>

          {/* Ride Info */}
          <div className="flex flex-col gap-2 mt-4 text-center">
            <p className="text-lg font-medium text-gray-800">
              {ride?.startName} → {ride?.destinationName}
            </p>
            <p className="font-medium text-gray-800">
              {inviterName} invited you
            </p>
            <p className="text-gray-500">
              {participantCount} participant
              {participantCount !== 1 ? "s" : ""} joined
            </p>
          </div>

          {/* Join Button */}
          <button
            onClick={handleJoin}
            disabled={joining}
            className={`mt-6 w-full cursor-pointer px-6 py-3 rounded-lg text-white font-medium transition-colors ${
              joined
                ? "bg-black cursor-pointer"
                : joining
                  ? "bg-gray-500 cursor-wait"
                  : "bg-black hover:bg-gray-800"
            }`}
          >
            {joined ? "Joined" : joining ? "Joining..." : "Join Ride"}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
