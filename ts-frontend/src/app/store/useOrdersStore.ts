import { create } from "zustand";

interface OrdersStoreState {
    openCreateOrderModal: boolean;
    modalType: ClientRole | null;
    openFilterOrderModal: boolean;

    toggleOpenCreateOrderModal: (type?: ClientRole) => void;
    toggleOpenFilterOrderModal: () => void;
}

export const useOrdersStore = create<OrdersStoreState>((set) => ({
    openCreateOrderModal: false,
    modalType: null,
    openFilterOrderModal: false,

    toggleOpenCreateOrderModal: (type?: ClientRole) =>
        set((state) => ({
            openCreateOrderModal: type ? true : false,
            modalType: type ?? null,
        })),
    toggleOpenFilterOrderModal: () =>
        set((state) => ({
            openFilterOrderModal: !state.openFilterOrderModal,
        })),
}));