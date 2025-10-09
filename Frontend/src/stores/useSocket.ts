import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import type { SocketState, JoinRidePayload } from "./types";

export const useSocket = create<SocketState>((set, get) => {
  const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
    path: "/sockets",
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
  });
  // Register core socket events
  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
    set({ isConnected: true, error: null });
  });

  socket.on("response", () => {});

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected");
    set({ isConnected: false });
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
    set({ error: err.message });
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

    joinRide: (payload: JoinRidePayload) => {
      socket.emit("joinRide", payload);
    },
  };
});
