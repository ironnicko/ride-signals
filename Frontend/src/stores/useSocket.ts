import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import type { SocketState } from "./types";
import { useAuth } from "./useAuth";
import { useOtherUsers } from "./useOtherUsers";
import api from "@/lib/axios";

export const useSocket = create<SocketState>((set, get) => {
  const { accessToken } = useAuth.getState();
  let onAnnounceCallback:
    | ((name: string, info: "join" | "info" | "success") => void)
    | null = null;

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

  useAuth.subscribe((state) => {
    if (get().socket && state.accessToken) {
      get().socket.auth = { token: `Bearer ${state.accessToken}` };
      if (!get().socket.connected) get().socket.connect();
    }
  });

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
      case "sentSignal": {
        if (onAnnounceCallback) console.log(response.data);
        onAnnounceCallback(response.data.signalType, "info");
        break;
      }
      case "userJoined": {
        const userId = response.data.userId;
        await fetchUsersByIds([userId]);
        const joinedUser = getUserById(userId);
        const name = joinedUser?.name || "Someone";
        if (onAnnounceCallback)
          onAnnounceCallback(`${name} Joined the Ride`, "join");
        break;
      }
      case "userLeft": {
        const userId = response.data.userId;
        const leftUser = getUserById(userId);
        const name = leftUser?.name || "Someone";
        if (onAnnounceCallback)
          onAnnounceCallback(`${name} Left the Ride`, "info");
        setUserLocation(userId, null);
        break;
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected");
    set({ isConnected: false, inRoom: false });
  });

  socket.on("connect_error", async (err) => {
    console.error("[Socket] Connection error:", err.message);
    if (err.message === "Unauthorized") {
      await api.post("/authenticated");
    }
    set({ error: err.message });
  });

  return {
    socket,
    isConnected: false,
    error: null,
    inRoom: false,
    connect: () => {
      if (!socket.connected) socket.connect();
    },
    disconnect: () => {
      if (socket.connected) socket.disconnect();
    },
    joinRide: (payload: { rideCode: string }) => {
      if (!get().inRoom) {
        socket.emit("joinRide", payload);
        set({ inRoom: true });
      }
    },
    sendLocation: (payload) => {
      socket.emit("sendLocation", payload);
    },
    leaveRide: (payload: { rideCode: string }) => {
      if (get().inRoom) {
        socket.emit("leaveRide", payload);
        set({ inRoom: false });
      }
    },
    sendSignal: (payload) => {
      socket.emit("sendSignal", payload);
    },
    onAnnounce: (
      cb: (name: string, info: "info" | "join" | "success") => void,
    ) => {
      onAnnounceCallback = cb;
    },
  };
});
