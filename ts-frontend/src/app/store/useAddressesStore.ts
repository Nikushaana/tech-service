import { create } from "zustand";

type AddressType = "company" | "individual";

interface AddressesStoreState {
    openCreateAddressModal: boolean;
    modalType: AddressType | null; // store the type here

    toggleOpenCreateAddressModal: (type?: AddressType) => void;
}

export const useAddressesStore = create<AddressesStoreState>((set) => ({
    openCreateAddressModal: false,
    modalType: null,

    toggleOpenCreateAddressModal: (type?: AddressType) =>
        set((state) => ({
            openCreateAddressModal: !state.openCreateAddressModal,
            modalType: type ?? state.modalType,
        })),
}));