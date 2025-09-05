import { create } from "zustand";

interface RegisterState {
    values: {
        phone?: string;
        code?: string;
        role?: "individual" | "company";
        name?: string;
        lastName?: string;
        companyAgentName?: string;
        companyAgentLastName?: string;
        companyName?: string;
        companyIdentificationCode?: string;
        password?: string;
        repeatPassword?: string;
    };
    errors: {
        phone?: string;
        code?: string;
        role?: string;
        name?: string;
        lastName?: string;
        companyAgentName?: string;
        companyAgentLastName?: string;
        companyName?: string;
        companyIdentificationCode?: string;
        password?: string;
        repeatPassword?: string;
    };
    setErrors: (key: string, value: string) => void;
    setValues: (key: string, value: string) => void;
    resetValues: () => void;
    resetErrors: () => void;
}

export const useRegisterStore = create<RegisterState>((set) => ({
    values: { role: "individual" },
    errors: {},
    setValues: (key, value) =>
        set((state) => ({ values: { ...state.values, [key]: value } })),
    setErrors: (key, value) =>
        set((state) => ({ errors: { ...state.errors, [key]: value } })),
    resetValues: () => set({ values: { role: "individual" } }),
    resetErrors: () => set({ errors: {} }),
}));