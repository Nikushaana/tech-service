import { create } from "zustand";
import { axiosAdmin, axiosCompany, axiosFront, axiosIndividual, axiosTechnician } from "../api/axios";
import { toast } from "react-toastify";
import * as Yup from "yup";

type Role = "individual" | "company" | "technician" | "admin";

interface LoginState {
    values: {
        phone?: string;
        password?: string;
    };
    errors: {
        phone?: string;
        password?: string;
    };
    loading: boolean;
    setValues: (key: string, value: string) => void;
    setErrors: (key: string, value: string) => void;
    setLoading: (value: boolean) => void;
    resetValues: () => void;
    resetErrors: () => void;
}

type AuthState = {
    currentUser: User | null;
    role: Role | null;
    loading: boolean;
    openLogOut: boolean;

    toggleLogOut: () => void;
    login: (role: Role, token: string) => void;
    logout: () => void;
    rehydrate: () => void;

    loginWithCredentials: (phone: string, password: string) => Promise<void>;
};

type Store = LoginState & AuthState;

export const useAuthStore = create<Store>((set, get) => ({
    // ---------------- LOGIN FORM STATE ----------------
    values: {},
    errors: {},
    loading: true,
    setValues: (key, value) =>
        set((state) => ({ values: { ...state.values, [key]: value } })),
    setErrors: (key, value) =>
        set((state) => ({ errors: { ...state.errors, [key]: value } })),
    setLoading: (value) => set({ loading: value }),
    resetValues: () => set({ values: {} }),
    resetErrors: () => set({ errors: {} }),

    // ---------------- AUTH STATE ----------------
    currentUser: null,
    role: null,
    openLogOut: false,

    toggleLogOut: () => set((state) => ({ openLogOut: !state.openLogOut })),

    login: (role, token) => {
        const roles: Role[] = ["individual", "company", "technician", "admin"];

        // Remove all other tokens
        roles.forEach((r) => {
            if (r !== role) localStorage.removeItem(`${r}Token`);
        });

        const tokenKey = `${role}Token`;
        localStorage.setItem(tokenKey, token);

        const axiosInstance =
            role === "individual"
                ? axiosIndividual
                : role === "company"
                    ? axiosCompany
                    : role === "technician"
                        ? axiosTechnician : axiosAdmin;

        set({ loading: true });

        axiosInstance
            .get(role)
            .then(({ data }) => {
                set({ currentUser: data, role });
            })
            .catch(() => {
                localStorage.removeItem(tokenKey);
            })
            .finally(() => {
                set({ loading: false });
            });
    },

    logout: () => {
        const { role } = get();
        if (!role) return;

        const axiosInstance =
            role === "individual"
                ? axiosIndividual
                : role === "company"
                    ? axiosCompany
                    : role === "technician"
                        ? axiosTechnician : axiosAdmin;

        const tokenKey = `${role}Token`;
        const token = localStorage.getItem(tokenKey);

        if (token) {
            set({ loading: true });
            axiosInstance
                .delete(`auth/${role}/logout`)
                .finally(() => {
                    localStorage.removeItem(tokenKey);
                    set({ currentUser: null, role: null, loading: false });
                    window.location.href = "/"
                });
        } else {
            localStorage.removeItem(tokenKey);
            set({ currentUser: null, role: null, loading: false });
            window.location.href = "/"
        }
    },

    rehydrate: () => {
        const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
        const isAdminPath = pathname.startsWith("/admin");
        const isUserPath = pathname.startsWith("/dashboard");

        const roles: Role[] = ["individual", "company", "technician", "admin"];
        set({ loading: true });

        let foundToken = false;

        for (const role of roles) {
            const tokenKey = `${role}Token`;
            const token = localStorage.getItem(tokenKey);

            if (!token) continue;

            // Admin should only rehydrate on /admin paths
            if (role === "admin" && !isAdminPath) continue;

            // Non-admin should not be on any /admin path
            if (role !== "admin" && isAdminPath) continue;

            const axiosInstance =
                role === "individual"
                    ? axiosIndividual
                    : role === "company"
                        ? axiosCompany
                        : role === "technician"
                            ? axiosTechnician : axiosAdmin;

            foundToken = true;

            axiosInstance
                .get(role)
                .then(({ data }) => {
                    set({ currentUser: data, role });

                    // Only redirect admin if they are actually admin
                    if (data.role === "admin" && pathname == "/admin") {
                        window.location.href = "/admin/panel/faqs";
                    }

                    if (isUserPath) {
                        const pathParts = pathname.split("/");
                        const pathRole = pathParts[2] as Role | undefined;
                        if (!pathRole || pathRole !== role) {
                            window.location.href = `/dashboard/${role}/${pathParts[3]}`;
                        }
                    }

                })
                .catch(() =>
                    localStorage.removeItem(tokenKey)
                )
                .finally(() => set({ loading: false }));

            break; // stop after the first valid token
        }

        if (!foundToken) {
            set({ loading: false })
            if (isAdminPath && pathname !== "/admin") {
                window.location.href = "/admin";
            }
            if (isUserPath) {
                window.location.href = "/auth/login";
            }
        };
    },

    // ----------------- LOGIN WITH PHONE/PASSWORD -----------------
    loginWithCredentials: (phone, password) => {
        set({ loading: true });
        get().resetErrors();

        const loginSchema = Yup.object().shape({
            phone: Yup.string()
                .matches(/^5\d{8}$/, "ნომერი უნდა დაიწყოს 5-ით და იყოს 9 ციფრი")
                .required("ტელეფონის ნომერი აუცილებელია"),
            password: Yup.string().required("პაროლი აუცილებელია"),
        });

        // RETURN the promise chain
        return loginSchema
            .validate({ phone, password }, { abortEarly: false })
            .then(() => {
                return axiosFront.post("auth/login", { phone, password });
            })
            .then((res) => {
                get().resetErrors();

                const role = res.data.user.role as Role;
                const token = res.data.token;

                // Check if the current pathname is /admin
                const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
                const isAdminPath = pathname.startsWith("/admin");

                if (isAdminPath && role !== "admin") {
                    // Block non-admin login on admin page
                    toast.error("თქვენ არ გაქვთ ადმინისტრატორის პრივილეგია", {
                        position: "bottom-right",
                        autoClose: 3000,
                    });
                    const tokenKey = `${role}Token`;
                    localStorage.removeItem(tokenKey)
                    return; // Stop login process
                }
                if (!isAdminPath && role == "admin") {
                    // Block non-admin login on admin page
                    toast.error("თქვენ არ გაქვთ მომხმარებლის პრივილეგია", {
                        position: "bottom-right",
                        autoClose: 3000,
                    });
                    const tokenKey = `${role}Token`;
                    localStorage.removeItem(tokenKey)
                    return; // Stop login process
                }

                // If allowed, continue login
                get().login(role, token);

                toast.success("ავტორიზაცია შესრულდა", {
                    position: "bottom-right",
                    autoClose: 3000,
                });

                // Redirect admin automatically
                if (role === "admin" && isAdminPath) {
                    window.location.href = "/admin/panel/faqs";
                }
                if (role === "company" || role === "individual") {
                    window.location.href = "/";
                }
            })
            .catch((err) => {
                if (err.inner) {
                    // Yup validation errors
                    err.inner.forEach((e: any) => {
                        if (e.path) {
                            get().setErrors(e.path, e.message);
                            toast.error(e.message, { position: "bottom-right", autoClose: 3000 });
                        }
                    });
                } else {
                    // Axios or other errors
                    toast.error("ავტორიზაცია ვერ შესრულდა", { position: "bottom-right", autoClose: 3000 });
                    get().setErrors("phone", "შეცდომა");
                    get().setErrors("password", "შეცდომა");
                }
            })
            .finally(() => set({ loading: false }));
    }
}));