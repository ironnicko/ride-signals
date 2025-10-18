import { create } from "zustand";
import type { SocketState } from "./types";
import { useAuth } from "./useAuth";
import { useOtherUsers } from "./useOtherUsers";
import api from "@/lib/axios";

export const useSocket = create<SocketState>((set, get) => {
  let onAnnounceCallback:
    | ((name: string, info: "join" | "info" | "success") => void)
    | null = null;

  let ws: WebSocket | null = null;
  let reconnectTimeout: any = null;

  const connect = () => {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    const token = useAuth.getState().accessToken;
    ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}?token=${encodeURIComponent(token)}`,
    );

    ws.onopen = () => {
      console.log("[WebSocket] Connected");
      set({ isConnected: true, error: null });
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      const {
        setUsersLocation,
        setUserLocation,
        fetchUsersByIds,
        getUserById,
      } = useOtherUsers.getState();
      switch (msg.eventType) {
        case "updateLocations":
          setUsersLocation(msg.data.locations);
          break;
        case "sentSignal":
          if (onAnnounceCallback)
            onAnnounceCallback(msg.data.signalType, "info");
          break;
        case "userJoined":
          await fetchUsersByIds([msg.data.userId]);
          const joinedUser = getUserById(msg.data.userId);
          if (onAnnounceCallback)
            onAnnounceCallback(
              `${joinedUser?.name || "Someone"} Joined the Ride`,
              "join",
            );
          break;
        case "userLeft":
          const leftUser = getUserById(msg.data.userId);
          if (onAnnounceCallback)
            onAnnounceCallback(
              `${leftUser?.name || "Someone"} Left the Ride`,
              "info",
            );
          setUserLocation(msg.data.userId, null);
          break;
      }
    };

    ws.onclose = () => {
      console.log("[WebSocket] Disconnected");
      set({ isConnected: false, inRoom: false });
      // Attempt reconnect
      reconnectTimeout = setTimeout(connect, 5000);
    };

    ws.onerror = async (err) => {
      console.error("[WebSocket] Error", err);
      set({ error: "Connection error" });
      // Handle unauthorized
      if (err && ws?.readyState === WebSocket.CLOSED) {
        await api.post("/authenticated");
      }
    };
  };

  const send = (data: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    } else {
      console.warn("[WebSocket] Cannot send, not connected");
    }
  };

  return {
    socket: ws as any,
    isConnected: false,
    error: null,
    inRoom: false,
    connect,
    disconnect: () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      ws?.close();
      ws = null;
      set({ isConnected: false, inRoom: false });
    },
    joinRide: (payload: { rideCode: string }) => {
      if (!get().inRoom) {
        send({ eventType: "joinRide", data: payload });
        set({ inRoom: true });
      }
    },
    leaveRide: (payload: { rideCode: string }) => {
      if (get().inRoom) {
        send({ eventType: "leaveRide", data: payload });
        set({ inRoom: false });
      }
    },
    sendLocation: (payload: any) => {
      console.log("Sending Location");
      send({ eventType: "sendLocation", data: payload });
    },
    sendSignal: (payload: any) => {
      send({ eventType: "sendSignal", data: payload });
    },
    onAnnounce: (
      cb: (name: string, info: "info" | "join" | "success") => void,
    ) => {
      onAnnounceCallback = cb;
    },
  };
});
