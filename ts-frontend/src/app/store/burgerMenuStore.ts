import { create } from "zustand";

interface BurgerMenuState {
    isOpen: boolean;
    openSideBar: boolean;
    openAdminSideBar: boolean;
    toggleBurgerMenu: () => void;
    toggleSideBar: () => void;
    toggleAdminSideBar: () => void;
    closeBurgerMenu: () => void;
    closeSideBar: () => void;
    closeAdminSideBar: () => void;
}

export const useBurgerMenuStore = create<BurgerMenuState>((set) => ({
    isOpen: false,
    openSideBar: false,
    openAdminSideBar: false,
    toggleBurgerMenu: () => set((state) => ({ isOpen: !state.isOpen, openSideBar: false })),
    toggleSideBar: () => set((state) => ({ openSideBar: !state.openSideBar })),
    toggleAdminSideBar: () => set((state) => ({ openAdminSideBar: !state.openAdminSideBar })),
    closeBurgerMenu: () => set({ isOpen: false }),
    closeSideBar: () => set({ openSideBar: false }),
    closeAdminSideBar: () => set({ openAdminSideBar: false }),
}));