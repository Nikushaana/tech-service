import { create } from "zustand";
import { axiosCompany, axiosIndividual } from "../api/axios";
import { toast } from "react-toastify";

type ReviewType = "company" | "individual";

interface ReviewsStoreState {
    reviews: any[];
    openCreateReviewModal: boolean;
    modalType: ReviewType | null; // store the type here
    loading: boolean;

    toggleOpenCreateReviewModal: (type?: ReviewType) => void;

    fetchReviews: (type: ReviewType) => Promise<void>;
    createReview: (type: ReviewType, data: any) => void;
}

export const useReviewsStore = create<ReviewsStoreState>((set, get) => ({
    reviews: [],
    openCreateReviewModal: false,
    modalType: null,
    loading: true,

    toggleOpenCreateReviewModal: (type?: ReviewType) =>
        set((state) => ({
            openCreateReviewModal: !state.openCreateReviewModal,
            modalType: type ?? state.modalType,
        })),

    fetchReviews: (type: ReviewType) => {
        const axiosInstance = type === "company" ? axiosCompany : axiosIndividual;
        set({ loading: true });

        return axiosInstance
            .get(`${type}/reviews`)
            .then((res) => set({ reviews: res.data }))
            .catch(() => { })
            .finally(() => { set({ loading: false }); });
    },

    createReview: async (type, data) => {
        const axiosInstance = type === "company" ? axiosCompany : axiosIndividual;
        try {
            await axiosInstance.post(`${type}/create-review`, data);
            await get().fetchReviews(type);
            toast.success("შეფასება დაემატა", { position: "bottom-right", autoClose: 3000 });
        } catch (error: any) {

            toast.error("შეკვეთა ვერ დაემატა", { position: "bottom-right", autoClose: 3000 });

            throw new Error("Failed"); // so component knows request failed
        }
    }
}));