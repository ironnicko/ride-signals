import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import Error from "next/error";
// import { Preferences } from "@capacitor/preferences";

interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: (idToken: string) => Promise<void>;
    logout: () => void;
}

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

const storage = {
    getItem: (name: string) => {
        const item = localStorage.getItem(name);
        return item ? JSON.parse(item) : null;
    },
    setItem: (name: string, value: any) =>
        localStorage.setItem(name, JSON.stringify(value)),
    removeItem: (name: string) => localStorage.removeItem(name),
};

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,

            login: async (email, password) => {
                try {
                    const res = await fetch(process.env.NEXT_PUBLIC_API_URL+"/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });
                    const data = await res.json();
                    set({
                        isAuthenticated: true,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    });
                } catch (err) {
                    set({ isAuthenticated: false, accessToken: null, refreshToken: null });
                    throw err;
                }
            },

            loginWithGoogle: async (idToken) => {
                try {

                    const res = await fetch(process.env.NEXT_PUBLIC_API_URL+"/auth/google", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ idToken }),
                    });
                    if (!res.ok){
                        throw Error
                    }
                    const data = await res.json();
                    set({
                        isAuthenticated: true,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    });
                } catch (err) {
                    set({ isAuthenticated: false, accessToken: null, refreshToken: null });
                    throw err;
                }
            },

            logout: () => {
                set({ isAuthenticated: false, accessToken: null, refreshToken: null });
            },
        }),
        {
            name: "auth-storage",
            storage,
        }
    )
);
