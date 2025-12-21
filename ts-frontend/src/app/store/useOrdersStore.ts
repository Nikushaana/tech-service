import { create } from "zustand";

type OrderType = "company" | "individual";

interface OrdersStoreState {
    openCreateOrderModal: boolean;
    modalType: OrderType | null; // store the type here

    toggleOpenCreateOrderModal: (type?: OrderType) => void;
}

export const useOrdersStore = create<OrdersStoreState>((set, get) => ({
    openCreateOrderModal: false,
    modalType: null,

    toggleOpenCreateOrderModal: (type?: OrderType) =>
        set((state) => ({
            openCreateOrderModal: !state.openCreateOrderModal,
            modalType: type ?? state.modalType,
        })),
}));