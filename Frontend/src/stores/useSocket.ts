import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import type { SocketState, GeoLocation } from "./types";
import { useAuth } from "./useAuth";

export const useSocket = create<SocketState>(
  (set, get) => {
  const { accessToken } = useAuth.getState();
  const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
    // path: "/sockets",
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    withCredentials: true,
    auth: {
      token: `Bearer ${accessToken}`,
    },
  });
  // Register core socket events
  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
    set({ isConnected: true, error: null });
  });

  socket.on("response", (response: { eventType: string; data: any }) => {
    console.log(response);
  });

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected");
    set({ isConnected: false });
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
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
      socket.emit("leaveRide", payload)
    },
  };
});
