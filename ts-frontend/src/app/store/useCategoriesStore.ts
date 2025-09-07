import { create } from "zustand";
import { axiosFront } from "../api/axios";

interface CategoriesStoreState {
    categories: any;

    fetchCategories: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesStoreState>((set, get) => ({
    categories: {},

    fetchCategories: () => {
        return axiosFront
            .get(`front/categories`)
            .then((res) => set({ categories: res.data }))
            .catch(() => { });
    },
}));