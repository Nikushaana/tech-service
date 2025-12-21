import { create } from "zustand";

type ReviewType = "company" | "individual";

interface ReviewsStoreState {
    openCreateReviewModal: boolean;
    modalType: ReviewType | null; // store the type here

    toggleOpenCreateReviewModal: (type?: ReviewType) => void;
}

export const useReviewsStore = create<ReviewsStoreState>((set, get) => ({
    openCreateReviewModal: false,
    modalType: null,

    toggleOpenCreateReviewModal: (type?: ReviewType) =>
        set((state) => ({
            openCreateReviewModal: !state.openCreateReviewModal,
            modalType: type ?? state.modalType,
        })),
}));