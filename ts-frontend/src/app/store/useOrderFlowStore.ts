import { create } from "zustand";

interface OrderFlowStoreState {
    openOrderFlowModal: { orderId: number; actionKey: "waitingDecision" | "waitingPayment" | "decisionCancel", role?: "company" | "individual" } | null;
    HandleOpenOrderFlowModal: (orderId: number, actionKey: "waitingDecision" | "waitingPayment" | "decisionCancel", role?: "company" | "individual") => void;
    HandleCloseOrderFlowModal: () => void;
}

export const useOrderFlowStore = create<OrderFlowStoreState>((set, get) => ({
    openOrderFlowModal: null,
    HandleOpenOrderFlowModal: (orderId, actionKey, role) =>
        set({ openOrderFlowModal: { orderId, actionKey, role } }),
    HandleCloseOrderFlowModal: () => set({ openOrderFlowModal: null }),
}));