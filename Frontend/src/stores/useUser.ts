import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserState, storage } from "./types"

export const useUser = create<UserState>()(
    persist(
        (set) => ({
            id: null,
            name: null,
            email: null,
            picture: null,
            createdAt: null,
            lastLoginAt: null,
            isActive: null
            }),
        {
            name: "auth-storage",
            storage,
        }
    )
);
