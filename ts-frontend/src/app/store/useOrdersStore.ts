import { create } from "zustand";

interface OrdersStoreState {
    openCreateOrderModal: boolean;
    openFilterOrderModal: boolean;

    toggleOpenCreateOrderModal: () => void;
    toggleCloseCreateOrderModal: () => void;
    toggleOpenFilterOrderModal: () => void;
}

export const useOrdersStore = create<OrdersStoreState>((set) => ({
    openCreateOrderModal: false,
    openFilterOrderModal: false,

    toggleOpenCreateOrderModal: () =>
        set((state) => ({
            openCreateOrderModal: true,
        })),
    toggleCloseCreateOrderModal: () =>
        set((state) => ({
            openCreateOrderModal: false,
        })),
    toggleOpenFilterOrderModal: () =>
        set((state) => ({
            openFilterOrderModal: !state.openFilterOrderModal,
        })),
}));