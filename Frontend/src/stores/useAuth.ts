import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState, storage } from "./types"
import Error from "next/error";

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            user: null,

            login: async (email, password) => {
                try {

                    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });
                    if (res.status != 200) {
                        throw res.statusText
                    }
                    const data = await res.json();
                    set({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        isAuthenticated: true,
                        user: data.user
                    });
                    return true;
                } catch (err) {
                    set(useAuth.getInitialState());
                    return false;
                }
            },

            loginWithGoogle: async (idToken) => {
                try {
                    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/google", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ idToken }),
                    });
                    if (!res.ok) {
                        throw Error
                    }
                    const data = await res.json();
                    set({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        isAuthenticated: true,
                        user: data.user
                    });

                } catch (err) {
                    set(useAuth.getInitialState());
                    throw err;
                }
            },

            setUser: (user) => {
                set({ user: user })
            },

            logout: () => {
                set(useAuth.getInitialState());
            },
        }),
        {
            name: "auth-storage",
            storage,
        }
    )
);
