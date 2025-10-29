import { create } from "zustand";
import { axiosCompany, axiosIndividual } from "../api/axios";
import { toast } from "react-toastify";

type UpdateOrderType = "company" | "individual";

interface UpdateOrderStoreState {
    currentOrder: any | null;
    openUpdateOrderModal: boolean;
    modalType: UpdateOrderType | null;
    loading: boolean;
    refetchTrigger: boolean;

    toggleOpenUpdateOrderModal: (type?: UpdateOrderType, orderData?: any) => void;

    updateOrder: (type: UpdateOrderType, data: any) => void;
}

export const useUpdateOrderStore = create<UpdateOrderStoreState>((set, get) => ({
    currentOrder: null,
    openUpdateOrderModal: false,
    modalType: null,
    loading: true,
    refetchTrigger: false,

    toggleOpenUpdateOrderModal: (type?: UpdateOrderType, orderData?: any) =>
        set((state) => ({
            openUpdateOrderModal: !state.openUpdateOrderModal,
            modalType: type ?? state.modalType,
            currentOrder: orderData,
        })),

    updateOrder: async (type, data) => {
        const axiosInstance = type === "company" ? axiosCompany : axiosIndividual;
        const currentOrder = get().currentOrder;
        if (!currentOrder) {
            toast.error("სერვისი ვერ განახლდა", { position: "bottom-right", autoClose: 3000 });
            return;
        }

        try {
            await axiosInstance.patch(`${type}/orders/${currentOrder.id}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("სერვისი განახლდა", { position: "bottom-right", autoClose: 3000 });
            set((state) => ({ refetchTrigger: !state.refetchTrigger }));
        } catch (error: any) {
            if (error.response.data.message == "Address is outside all branch coverage areas. Please choose a closer location.") {
                toast.error("აირჩიე მისამართი რომელიც სერვისის დაფარვის ზონაშია", { position: "bottom-right", autoClose: 3000 });
            } else if (error.response.data.message == "Inactive user cannot update orders") {
                toast.error("თქვენ ვერ განაახლებთ სერვისს, რადგან თქვენი პროფილი გასააქტიურებელია", { position: "bottom-right", autoClose: 3000 });
            } else {
                toast.error("სერვისი ვერ განახლდა", { position: "bottom-right", autoClose: 3000 });
            }

            throw new Error("Failed"); // so component knows request failed
        }
    }
}));