import { create } from "zustand";

interface ResetPasswordState {
    values: {
        phone?: string;
        code?: string;
        newPassword?: string;
        repeatNewPassword?: string;
    };
    errors: {
        phone?: string;
        code?: string;
        newPassword?: string;
        repeatNewPassword?: string;
    };
    setErrors: (key: string, value: string) => void;
    setValues: (key: string, value: string) => void;
    resetValues: () => void;
    resetErrors: () => void;
}

export const useResetPasswordStore = create<ResetPasswordState>((set) => ({
    values: {},
    errors: {},
    setValues: (key, value) =>
        set((state) => ({ values: { ...state.values, [key]: value } })),
    setErrors: (key, value) =>
        set((state) => ({ errors: { ...state.errors, [key]: value } })),
    resetValues: () => set({ values: {} }),
    resetErrors: () => set({ errors: {} }),
}));