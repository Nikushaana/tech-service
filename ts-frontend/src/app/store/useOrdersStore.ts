import { create } from "zustand";

interface OrdersStoreState {
    openCreateOrderModal: boolean;
    modalType: ClientRole | null;

    toggleOpenCreateOrderModal: (type?: ClientRole) => void;
}

export const useOrdersStore = create<OrdersStoreState>((set) => ({
    openCreateOrderModal: false,
    modalType: null,

    toggleOpenCreateOrderModal: (type?: ClientRole) =>
        set((state) => ({
            openCreateOrderModal: type ? true : false,
            modalType: type ?? null,
        })),
}));