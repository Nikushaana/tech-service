import { create } from "zustand";

interface typeOption {
    id: number;
    name: string;
    nameEng: string;
}

interface statusOption {
    id: number;
    name: string;
}

interface TransactionsStoreState {
    transactionType: typeOption[];
    transactionStatus: statusOption[];
    openFilterTransactionModal: boolean;

    toggleOpenFilterTransactionModal: () => void;
}

export const useTransactionsStore = create<TransactionsStoreState>((set) => ({
    transactionType: [
        { id: 2, name: "ჩამოჭრა", nameEng: "debit" },
        { id: 3, name: "ჩარიცხვა", nameEng: "credit" },
    ],

    transactionStatus: [
        { id: 1, name: "pending" },
        { id: 2, name: "paid" },
        { id: 3, name: "failed" },
        { id: 4, name: "refunded" },
    ],

    openFilterTransactionModal: false,

    toggleOpenFilterTransactionModal: () =>
        set((state) => ({
            openFilterTransactionModal: !state.openFilterTransactionModal,
        })),
}));