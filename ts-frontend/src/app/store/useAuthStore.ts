import { create } from "zustand";
import { axiosCompany, axiosIndividual, axiosTechnician } from "../api/axios";

type Role = "individual" | "company" | "technician";

type AuthState = {
    currentUser: User | null;
    role: Role | null;
    loading: boolean;
    openLogOut: boolean;

    toggleLogOut: () => void;
    login: (role: Role, token: string) => void;
    logout: () => void;
    rehydrate: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
    currentUser: null,
    role: null,
    loading: true,
    openLogOut: false,

    toggleLogOut: () => set((state) => ({ openLogOut: !state.openLogOut })),
    login: (role, token) => {
        const axiosInstance =
            role === "individual"
                ? axiosIndividual
                : role === "company"
                    ? axiosCompany
                    : axiosTechnician;

        const tokenKey = `${role}Token`;
        localStorage.setItem(tokenKey, token);

        set({ loading: true });

        axiosInstance
            .get(role)
            .then(({ data }) => {
                set({ currentUser: data, role });
            })
            .catch(() => {
                localStorage.removeItem(tokenKey);
            })
            .finally(() => {
                set({ loading: false });
            });
    },

    logout: () => {
        const { role } = get();
        if (!role) return;

        const axiosInstance =
            role === "individual"
                ? axiosIndividual
                : role === "company"
                    ? axiosCompany
                    : axiosTechnician;

        const tokenKey = `${role}Token`;

        const token = localStorage.getItem(tokenKey);
        if (token) {
            set({ loading: true });
            axiosInstance
                .delete(`auth/${role}/logout`)
                .finally(() => {
                    localStorage.removeItem(tokenKey);
                    set({ currentUser: null, role: null, loading: false });
                });
        } else {
            localStorage.removeItem(tokenKey);
            set({ currentUser: null, role: null, loading: false });
        }
    },

    rehydrate: () => {
        const roles: Role[] = ["individual", "company", "technician"];
        set({ loading: true });

        let foundToken = false;

        for (const role of roles) {
            const tokenKey = `${role}Token`;
            const token = localStorage.getItem(tokenKey);
            if (token) {
                foundToken = true;
                const axiosInstance =
                    role === "individual"
                        ? axiosIndividual
                        : role === "company"
                            ? axiosCompany
                            : axiosTechnician;

                axiosInstance
                    .get(role)
                    .then(({ data }) => set({ currentUser: data, role }))
                    .catch(() => localStorage.removeItem(tokenKey))
                    .finally(() => set({ loading: false }));

                break; // stop after the first valid token
            }
        }

        // If no token found, stop loading
        if (!foundToken) {
            set({ loading: false });
        }
    },
}));