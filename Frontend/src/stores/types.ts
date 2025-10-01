// import { Preferences } from "@capacitor/preferences";

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

export interface GeoLocation {
    lat: number
    lng: number
}

export interface Participant { userId: string; role: string; joinedAt: string }
export interface Settings { maxRiders: number; visibility: string }

export interface RideState {
    _id: string | null;
    rideCode: string | null;
    status: string | null;
    createdAt: string | null;
    endedAt?: string | null;
    participants: Participant[] | null;
    settings: Settings | null;
    start: GeoLocation | null;
    destination: GeoLocation | null;
    startName: string | null;
    destinationName: string | null;
}


export interface UserState {
    id: string | null
    name: string | null
    email: string | null
    picture?: string | null
    createdAt: string | null
    lastLoginAt: string | null
    isActive: boolean | null
    currentRide: string | null
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
    isAuthenticated: Boolean;
    user: UserState | null;
    login: (email: string, password: string) => Promise<Boolean>;
    setUser: (user: UserState) => void
    loginWithGoogle: (idToken: string) => Promise<void>;
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
