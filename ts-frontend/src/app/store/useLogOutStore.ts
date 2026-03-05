import { create } from "zustand";

type LogOutState = {
    openLogOut: boolean;
    toggleLogOut: () => void;
};

export const useLogOutStore = create<LogOutState>((set, get) => ({
    openLogOut: false,
    toggleLogOut: () => set((state) => ({ openLogOut: !state.openLogOut })),
}));