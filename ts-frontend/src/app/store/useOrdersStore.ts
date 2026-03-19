import { create } from "zustand";

interface OrdersStoreState {
    openCreateOrderModal: boolean;
    openFilterOrderModal: boolean;

    toggleOpenCreateOrderModal: () => void;
    toggleOpenFilterOrderModal: () => void;
}

export const useOrdersStore = create<OrdersStoreState>((set) => ({
    openCreateOrderModal: false,
    openFilterOrderModal: false,

    toggleOpenCreateOrderModal: () =>
        set((state) => ({
            openCreateOrderModal: !state.openCreateOrderModal,
        })),
    toggleOpenFilterOrderModal: () =>
        set((state) => ({
            openFilterOrderModal: !state.openFilterOrderModal,
        })),
}));