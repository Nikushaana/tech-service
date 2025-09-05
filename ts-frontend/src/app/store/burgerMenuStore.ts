import { create } from "zustand";

interface BurgerMenuState {
    isOpen: boolean;
    openSideBar: boolean;
    toggleBurgerMenu: () => void;
    toggleSideBar: () => void;
    closeBurgerMenu: () => void;
    closeSideBar: () => void;
}

export const useBurgerMenuStore = create<BurgerMenuState>((set) => ({
    isOpen: false,
    openSideBar: false,
    toggleBurgerMenu: () => set((state) => ({ isOpen: !state.isOpen, openSideBar: false })),
    toggleSideBar: () => set((state) => ({ openSideBar: !state.openSideBar })),
    closeBurgerMenu: () => set({ isOpen: false }),
    closeSideBar: () => set({ openSideBar: false }),
}));