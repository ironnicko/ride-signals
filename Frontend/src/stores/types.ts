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


export const storage = {
    getItem: (name: string) => {
        const item = localStorage.getItem(name);
        return item ? JSON.parse(item) : null;
    },
    setItem: (name: string, value: any) =>
        localStorage.setItem(name, JSON.stringify(value)),
    removeItem: (name: string) => localStorage.removeItem(name),
};

export interface AuthState {
    // isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    login: (email: string, password: string) => Promise<Boolean>;
    loginWithGoogle: (idToken: string) => Promise<void>;
    logout: () => void;
}

export interface UserState {
    id: string | null
    name: string | null
    email: string | null
    picture?: string | null
    createdAt: string | null
    lastLoginAt: string | null
    isActive: boolean | null
}