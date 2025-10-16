import { create } from "zustand";
import { GeoLocation, OtherUsersStore, UserState } from "./types";
import { GET_USERS_BY_IDS } from "@/lib/graphql/query";
import { gqlClient } from "@/lib/graphql/client";

export const useOtherUsers = create<OtherUsersStore>((set, get) => ({
  users: {},

  addUser: (user) =>
    set((state) => ({
      users: { ...state.users, [user.id as string]: user },
    })),

  addUsers: (users) =>
    set((state) => {
      const newUsers = { ...state.users };
      users.forEach((u) => {
        if (u.id) newUsers[u.id] = u;
      });
      return { users: newUsers };
    }),

  getUserById: (id) => get().users[id],

  setUserLocation: (userId, location) =>
    set((state) => {
      const existingUser = state.users[userId];
      if (!existingUser) return state;

      return {
        users: {
          ...state.users,
          [userId]: { ...existingUser, location },
        },
      };
    }),

  setUsersLocation: (userLocations: Record<string, string>) =>
    set(() => {
      const updatedUsers = {};

      if (Object.keys(userLocations).length === 0) {
        for (const userId in updatedUsers) {
          updatedUsers[userId] = { ...updatedUsers[userId], location: null };
        }
        return { users: updatedUsers };
      }

      for (const [userId, locationString] of Object.entries(userLocations)) {
        const existingUser = updatedUsers[userId];
        const parsedLocation = JSON.parse(locationString) as GeoLocation;

        updatedUsers[userId] = { ...existingUser, location: parsedLocation };
      }

      return { users: updatedUsers };
    }),

  fetchUsersByIds: async (ids) => {
    const uniqueIds = ids.filter(
      (id, i) =>
        id &&
        ids.indexOf(id) === i &&
        (get().users[id]?.name === "Unknown" || !get().users[id]?.name),
    ); // fetch only if not already cached

    if (uniqueIds.length === 0) return;

    try {
      const { data } = await gqlClient.query<{ usersByIds: UserState[] }>({
        query: GET_USERS_BY_IDS,
        variables: { ids: uniqueIds },
        fetchPolicy: "network-only",
      });

      if (data?.usersByIds) {
        set((state) => {
          const newUsers = { ...state.users };
          data.usersByIds.forEach((u) => {
            if (u.id) newUsers[u.id] = u;
          });
          return { users: newUsers };
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  },

  clearUsers: () => set({ users: {} }),
}));
