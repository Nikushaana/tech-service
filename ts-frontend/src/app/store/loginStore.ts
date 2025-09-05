import { create } from "zustand";

interface LoginState {
    values: {
        phone?: string;
        password?: string;
    };
    errors: {
        phone?: string;
        password?: string;
    };
    setValues: (key: string, value: string) => void;
    setErrors: (key: string, value: string) => void;
    resetValues: () => void;
    resetErrors: () => void;
}

export const useLoginStore = create<LoginState>((set) => ({
    values: {},
    errors: {},
    setValues: (key, value) =>
        set((state) => ({ values: { ...state.values, [key]: value } })),
    setErrors: (key, value) =>
        set((state) => ({ errors: { ...state.errors, [key]: value } })),
    resetValues: () => set({ values: {} }),
    resetErrors: () => set({ errors: {} }),
}));