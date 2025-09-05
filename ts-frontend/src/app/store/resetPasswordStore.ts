import { create } from "zustand";

interface ResetPasswordState {
    values: {
        phone?: string;
        code?: string;

        testcode?: string;

        newPassword?: string;
        repeatNewPassword?: string;
    };
    errors: {
        phone?: string;
        code?: string;
        newPassword?: string;
        repeatNewPassword?: string;
    };
    loading: boolean;
    setErrors: (key: string, value: string) => void;
    setValues: (key: string, value: string) => void;
    setLoading: (value: boolean) => void;
    resetValues: () => void;
    resetErrors: () => void;
}

export const useResetPasswordStore = create<ResetPasswordState>((set) => ({
    values: {},
    errors: {},
    loading: false,
    setValues: (key, value) =>
        set((state) => ({ values: { ...state.values, [key]: value } })),
    setErrors: (key, value) =>
        set((state) => ({ errors: { ...state.errors, [key]: value } })),
    setLoading: (value) => set({ loading: value }),
    resetValues: () => set({ values: {} }),
    resetErrors: () => set({ errors: {} }),
}));