import { create } from "zustand";

type UpdateOrderType = "company" | "individual";

interface UpdateOrderStoreState {
    currentOrder: any | null;
    openUpdateOrderModal: boolean;
    modalType: UpdateOrderType | null;

    toggleOpenUpdateOrderModal: (type?: UpdateOrderType, orderData?: any) => void;
}

export const useUpdateOrderStore = create<UpdateOrderStoreState>((set, get) => ({
    currentOrder: null,
    openUpdateOrderModal: false,
    modalType: null,

    toggleOpenUpdateOrderModal: (type?: UpdateOrderType, orderData?: any) =>
        set((state) => ({
            openUpdateOrderModal: type ? true : false,
            modalType: type ?? null,
            currentOrder: orderData,
        })),
}));