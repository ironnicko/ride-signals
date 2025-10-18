import { create } from "zustand";
import { SocketState } from "./types";
import { useAuth } from "./useAuth";
import { useOtherUsers } from "./useOtherUsers";
import { WebSocketManager } from "@/lib/WebSocketManager";

export const useSocket = create<SocketState>((set, get) => {
  let manager: WebSocketManager | null = null;
  let announceCb:
    | ((msg: string, type: "info" | "join" | "success") => void)
    | null = null;

  const handleMessage = (msg: any) => {
    const otherUsers = useOtherUsers.getState();

    switch (msg.eventType) {
      case "updateLocations":
        otherUsers.setUsersLocation(msg.data.locations);
        break;
      case "sentSignal":
        announceCb?.(msg.data.signalType, "info");
        break;
      case "userJoined":
        // if (msg.data.userId !== auth.user.id) {
          otherUsers.fetchUsersByIds([msg.data.userId]).then(() => {
            const user = otherUsers.getUserById(msg.data.userId);
            announceCb?.(`${user?.name || "Someone"} joined the ride`, "join");
          });
        // }
        break;
      case "userLeft":
        const user = otherUsers.getUserById(msg.data.userId);
        announceCb?.(`${user?.name || "Someone"} left the ride`, "info");
        otherUsers.setUserLocation(msg.data.userId, null);
        break;
    }
  };

  return {
    isConnected: false,
    inRoom: false,
    error: null,

    connect: () => {
      const token = useAuth.getState().accessToken;
      manager = new WebSocketManager(
        process.env.NEXT_PUBLIC_SOCKET_URL!,
        token,
        handleMessage,
      );
      manager.connect();
      set({ isConnected: true });
    },

    disconnect: () => {
      manager?.disconnect();
      manager = null;
      set({ isConnected: false, inRoom: false });
    },

    joinRide: (data) => {
      manager?.send({ eventType: "joinRide", data });
      set({ inRoom: true });
    },

    leaveRide: (data) => {
      manager?.send({ eventType: "leaveRide", data });
      set({ inRoom: false });
    },

    sendLocation: (data) => manager?.send({ eventType: "sendLocation", data }),
    sendSignal: (data) => manager?.send({ eventType: "sendSignal", data }),

    onAnnounce: (cb) => (announceCb = cb),
  };
});
