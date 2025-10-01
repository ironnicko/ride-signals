import { create } from "zustand";
import { RidesStore } from "./types";

export const useRides = create<RidesStore>()(
    (set) => ({
        rides: [],

        addRide: (ride) =>
            set((state) => ({
                rides: [...state.rides, ride],
            })),

        removeRide: (rideCode) =>
            set((state) => ({
                rides: state.rides.filter((r) => r.rideCode !== rideCode),
            })),

        setRides: (rides) =>
            set(() => ({
                rides,
            })),

        replaceRide: (ride) =>
            set((state) => ({
                rides: state.rides.map((r) => (r.rideCode === ride.rideCode) ? ride : r),
            })),

        clearRides: () => set({ rides: [] }),
    })
);
