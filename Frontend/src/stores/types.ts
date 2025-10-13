// import { Preferences } from "@capacitor/preferences";

import { Socket } from "socket.io-client";

// Utility to detect if we are in Capacitor
// const isCapacitor = typeof window !== "undefined" && window?.Capacitor;

// const storage = isCapacitor
//   ? {
//       getItem: async (name: string) => {
//         const { value } = await Preferences.get({ key: name });
//         return value ? JSON.parse(value) : null;
//       },
//       setItem: async (name: string, value: any) =>
//         Preferences.set({ key: name, value: JSON.stringify(value) }),
//       removeItem: async (name: string) => Preferences.remove({ key: name }),
//     }
//   : {
//       getItem: (name: string) => {
//         const item = localStorage.getItem(name);
//         return item ? JSON.parse(item) : null;
//       },
//       setItem: (name: string, value: any) =>
//         localStorage.setItem(name, JSON.stringify(value)),
//       removeItem: (name: string) => localStorage.removeItem(name),
//     };
//

export type Announcement = {
  id: string;
  type?: "info" | "success" | "join";
  message: string;
};

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Participant {
  userId: string;
  role: string;
  joinedAt: string;
}
export interface Settings {
  maxRiders: number;
  visibility: "public" | "private";
}

export interface RideState {
  _id: string | null;
  rideCode: string | null;
  status: "not started" | "started" | "ended" | null;
  createdAt: string | null;
  createdBy: string | null;
  endedAt?: string | null;
  startedAt?: string | null;
  participants: Participant[] | null;
  settings: Settings | null;
  start: GeoLocation | null;
  destination: GeoLocation | null;
  startName: string | null;
  destinationName: string | null;
  tripName: string | null;
}

export interface DashboardState {
  formIndex: number;
  toLocation: GeoLocation | null;
  fromLocation: GeoLocation | null;
  userLocation: GeoLocation | null;
  toLocationName: string | null;
  fromLocationName: string | null;
  maxRiders: number;
  visibility: "public" | "private";
  tripName: string | null;
}

export interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  picture?: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
  isActive: boolean | null;
  currentRide: string | null;
  location?: GeoLocation | null;
}

export interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  inRoom: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  joinRide: (payload: { rideCode: string }) => void;
  sendLocation: (payload: { rideCode: string; location: GeoLocation }) => void;
  leaveRide: (payload: { rideCode: string }) => void;
  onUserJoin: (cb: (name: string) => void) => void;
}

export const storage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) =>
    localStorage.setItem(name, JSON.stringify(value)),
  removeItem: (name: string) => localStorage.removeItem(name),
};

export interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: UserState | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  setUser: (user: UserState) => void;
  loginWithGoogle: (respnose: AuthStore) => void;
  logout: () => void;
}

export interface RidesStore {
  rides: RideState[];
  addRide: (ride: RideState) => void;
  removeRide: (id: string) => void;
  setRides: (rides: RideState[]) => void;
  replaceRide: (ride: RideState) => void;
  clearRides: () => void;
}

export interface OtherUsersStore {
  users: Record<string, UserState>; // key = userId
  addUser: (user: UserState) => void;
  addUsers: (users: UserState[]) => void;
  setUserLocation: (userId: string, location: GeoLocation | null) => void;
  setUsersLocation: (userLocations: Record<string, string>) => void;
  getUserById: (id: string) => UserState | undefined;
  fetchUsersByIds: (ids: string[]) => Promise<void>;
  clearUsers: () => void;
}
