import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthStore, storage } from "./types"
import Error from "next/error";
import { toast } from "react-toastify";

export const useAuth = create<AuthStore>()(
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
                    if (!res.ok) {
                        const errRes = await res.json();
                        toast.error(errRes.error)
                        throw errRes.error
                    }
                    const data = await res.json();
                    set({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        isAuthenticated: true,
                        user: data.user
                    });
                    toast.success("Signed In Successfully!")
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
                        const errRes = await res.json();
                        toast.error(errRes.error)
                        throw errRes.error
                    }
                    const data = await res.json();
                    toast.success("Signed In Successfully!")
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
