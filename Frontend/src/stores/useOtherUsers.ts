import { create } from "zustand";
import { OtherUsersStore, UserState } from "./types";
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

    fetchUsersByIds: async (ids) => {
        const uniqueIds = ids.filter(
            (id, i) => id && ids.indexOf(id) === i && !get().users[id]
        ); // fetch only if not already cached

        if (uniqueIds.length === 0) return;

        try {
            const { data } = await gqlClient.query<{ usersByIds: UserState[] }>({
                query: GET_USERS_BY_IDS,
                variables: { ids: uniqueIds },
                fetchPolicy: "network-only",
            });

            if (data?.usersByIds) {
                get().addUsers(data.usersByIds);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    },

    clearUsers: () => set({ users: {} }),
}));
