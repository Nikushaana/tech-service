import { create } from "zustand";
import { axiosCompany, axiosIndividual } from "../api/axios";
import { toast } from "react-toastify";

type OrderType = "company" | "individual";

interface OrdersStoreState {
    orders: any[];
    openCreateOrderModal: boolean;
    modalType: OrderType | null; // store the type here
    loading: boolean;

    toggleOpenCreateOrderModal: (type?: OrderType) => void;

    fetchOrders: (type: OrderType) => Promise<void>;
    createOrder: (type: OrderType, data: any) => void;
}

export const useOrdersStore = create<OrdersStoreState>((set, get) => ({
    orders: [],
    openCreateOrderModal: false,
    modalType: null,
    loading: true,

    toggleOpenCreateOrderModal: (type?: OrderType) =>
        set((state) => ({
            openCreateOrderModal: !state.openCreateOrderModal,
            modalType: type ?? state.modalType,
        })),

    fetchOrders: (type: OrderType) => {
        const axiosInstance = type === "company" ? axiosCompany : axiosIndividual;
        set({ loading: true });

        return axiosInstance
            .get(`${type}/orders`)
            .then((res) => set({ orders: res.data }))
            .catch(() => { })
            .finally(() => { set({ loading: false }); });
    },

    createOrder: async (type, data) => {
        const axiosInstance = type === "company" ? axiosCompany : axiosIndividual;
        try {
            await axiosInstance.post(`${type}/create-order`, data);
            await get().fetchOrders(type);
            toast.success("შეკვეთა დაემატა", { position: "bottom-right", autoClose: 3000 });
        } catch (error: any) {
            if (error.response.data.message == "Inactive user cannot create orders") {
                toast.error("თქვენ ვერ დაამატებთ შეკვეთას, რადგან თქვენი პროფილი გასააქტიურებელია", { position: "bottom-right", autoClose: 3000 });
            } else {
                toast.error("შეკვეთა ვერ დაემატა", { position: "bottom-right", autoClose: 3000 });
            }

            throw new Error("Failed"); // so component knows request failed
        }
    }
}));