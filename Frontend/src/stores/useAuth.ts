import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState, storage } from "./types"
import Error from "next/error";
import { useUser } from "./useUser";

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,

            login: async (email, password) => {
                try {
                    const { setUser } = useUser.getState();
                    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });
                    if (res.status != 200) {
                        throw res.statusText
                    }
                    const data = await res.json();
                    setUser(data.user)
                    set({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    });
                    return true;
                } catch (err) {
                    set(useAuth.getInitialState());
                    return false;
                }
            },

            loginWithGoogle: async (idToken) => {
                try {
                    const { setUser } = useUser.getState();
                    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/google", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ idToken }),
                    });
                    if (!res.ok) {
                        throw Error
                    }
                    const data = await res.json();
                    setUser(data.user)
                    set({

                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    });

                } catch (err) {
                    set(useAuth.getInitialState());
                    throw err;
                }
            },

            logout: () => {
                const { setUser } = useUser.getState();
                set(useAuth.getInitialState());
                setUser(useUser.getInitialState())
            },
        }),
        {
            name: "auth-storage",
            storage,
        }
    )
);
