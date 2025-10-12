import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import type { SocketState, GeoLocation } from "./types";
import { useAuth } from "./useAuth";
import { useOtherUsers } from "./useOtherUsers";
import api from "@/lib/axios";

export const useSocket = create<SocketState>((set, get) => {
  const { accessToken } = useAuth.getState();
  const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 5000,
    withCredentials: true,
    auth: {
      token: `Bearer ${accessToken}`,
    },
  });

  let onUserJoinCallback: ((name: string) => void) | null = null;

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
    set({ isConnected: true, error: null });
  });

  socket.on("response", async (response: { eventType: string; data: any }) => {
    const { setUsersLocation, setUserLocation, fetchUsersByIds, getUserById } =
      useOtherUsers.getState();
    switch (response.eventType) {
      case "updateLocations": {
        const locations = response.data.locations;
        setUsersLocation(locations);
        break;
      }
      case "userJoined": {
        const userId = response.data.userId;
        await fetchUsersByIds([userId]);
        const joinedUser = getUserById(userId);
        const name = joinedUser?.name || "Someone";
        if (onUserJoinCallback) onUserJoinCallback(name);
        break;
      }
      case "userLeft": {
        const userId = response.data.userId;
        const leftUser = getUserById(userId);
        const name = leftUser?.name || "Someone";
        if (onUserJoinCallback) onUserJoinCallback(name);
        setUserLocation(userId, null);
        break;
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected");
    set({ isConnected: false });
  });

  socket.on("connect_error", async (err) => {
    console.error("[Socket] Connection error:", err.message);
    if (err.message === "Unauthorized") {
      await api.post("/authenticated");
    }
    set({ error: err.message });
  });

  useAuth.subscribe((state) => {
    if (get().socket && state.accessToken) {
      get().socket.auth = { token: `Bearer ${state.accessToken}` };
      if (!get().socket.connected) get().socket.connect();
    }
  });

  return {
    socket,
    isConnected: false,
    error: null,
    connect: () => {
      if (!socket.connected) socket.connect();
    },
    disconnect: () => {
      if (socket.connected) socket.disconnect();
    },
    joinRide: (payload: { rideCode: string }) => {
      socket.emit("joinRide", payload);
    },
    sendLocation: (payload: { rideCode: string; location: GeoLocation }) => {
      socket.emit("sendLocation", payload);
    },
    leaveRide: (payload: { rideCode: string }) => {
      socket.emit("leaveRide", payload);
    },

    onUserJoin: (cb: (name: string) => void) => {
      onUserJoinCallback = cb;
    },
  };
});
