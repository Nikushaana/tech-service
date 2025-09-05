import { create } from "zustand";
import { axiosCompany, axiosIndividual } from "../api/axios";
import { toast } from "react-toastify";

type AddressType = "company" | "individual";

interface AddressesStoreState {
    addresses: any[];
    openCreateAddressModal: boolean;
    modalType: AddressType | null; // store the type here

    toggleOpenCreateAddressModal: (type?: AddressType) => void;

    fetchAddresses: (type: AddressType) => Promise<void>;
    deleteAddress: (type: AddressType, id: number) => Promise<void>;
    createAddress: (type: AddressType, data: any) => void;
}

export const useAddressesStore = create<AddressesStoreState>((set, get) => ({
    addresses: [],
    openCreateAddressModal: false,
    modalType: null,

    toggleOpenCreateAddressModal: (type?: AddressType) =>
        set((state) => ({
            openCreateAddressModal: !state.openCreateAddressModal,
            modalType: type ?? state.modalType,
        })),

    fetchAddresses: (type: AddressType) => {
        const axiosInstance = type === "company" ? axiosCompany : axiosIndividual;
        return axiosInstance
            .get(`${type}/addresses`)
            .then((res) => set({ addresses: res.data }))
            .catch(() => { });
    },

    deleteAddress: (type: AddressType, id: number) => {
        const axiosInstance = type === "company" ? axiosCompany : axiosIndividual;
        return axiosInstance
            .delete(`${type}/addresses/${id}`)
            .then(() => get().fetchAddresses(type).then(() => {
                toast.success("მისამართი წაიშალა", { position: "bottom-right", autoClose: 3000 });
            }))
            .catch((error) => {
                if (error.response?.data?.message === "Address cannot be deleted because it is used in an order") {
                    toast.error("მისამართი ვერ წაიშლება, რადგან გამოყენებულია ერთ-ერთ შეკვეთაში", { position: "bottom-right", autoClose: 3000 });
                } else {
                    toast.error("მისამართი ვერ წაიშალა", { position: "bottom-right", autoClose: 3000 });
                }
            });
    },

    createAddress: (type, data) => {
        const axiosInstance = type === "company" ? axiosCompany : axiosIndividual;
        axiosInstance
            .post(`${type}/create-address`, data)
            .then(() => {
                get().fetchAddresses(type);
                toast.success("მისამართი დაემატა", { position: "bottom-right", autoClose: 3000 });
            })
            .catch(() =>
                toast.error("მისამართი ვერ დაემატა", { position: "bottom-right", autoClose: 3000 })
            );
    },
}));