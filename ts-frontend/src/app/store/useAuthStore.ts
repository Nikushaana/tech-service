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
    formLoading: boolean;
    setValues: (key: string, value: string) => void;
    setErrors: (key: string, value: string) => void;
    setFormLoading: (value: boolean) => void;
    resetValues: () => void;
    resetErrors: () => void;

    login: (role: Role | "individualOrCompany") => void;
}

type AuthState = {
    currentUser: User | null;
    authLoading: boolean;
    openLogOut: boolean;
    setCurrentUser: (user: User | null) => void;
    toggleLogOut: () => void;
    setAuthLoading: (value: boolean) => void;

    rehydrateClient: () => void;
    rehydrateAdmin: () => void;
    logout: () => void;
};

type Store = LoginState & AuthState;

const loginSchema = Yup.object().shape({
    phone: Yup.string()
        .matches(/^5\d{8}$/, "ნომერი უნდა დაიწყოს 5-ით და იყოს 9 ციფრი")
        .required("ტელეფონის ნომერი აუცილებელია"),
    password: Yup.string().required("პაროლი აუცილებელია"),
});

export const useAuthStore = create<Store>((set, get) => ({
    values: {},
    errors: {},
    formLoading: false,
    setValues: (key, value) =>
        set((state) => ({ values: { ...state.values, [key]: value } })),
    setErrors: (key, value) =>
        set((state) => ({ errors: { ...state.errors, [key]: value } })),
    setFormLoading: (value) => set({ formLoading: value }),
    resetValues: () => set({ values: {} }),
    resetErrors: () => set({ errors: {} }),

    currentUser: null,
    openLogOut: false,
    authLoading: true,
    setCurrentUser: (user) => set({ currentUser: user }),
    setAuthLoading: (value) => set({ authLoading: value }),
    toggleLogOut: () => set((state) => ({ openLogOut: !state.openLogOut })),

    // login

    login: (role: Role | "individualOrCompany") => {
        const { values, resetErrors, setErrors, setFormLoading, setCurrentUser } = get();
        const roles: Role[] = ["individual", "company", "technician", "admin"];
        roles.forEach((r) => localStorage.removeItem(`${r}Token`));

        resetErrors();
        setFormLoading(true);

        loginSchema
            .validate(values, { abortEarly: false })
            .then(() => {
                const url = role === "admin" ? "auth/admin/login" : "auth/login-client";
                return axiosFront.post(url, values);
            })
            .then((res) => {
                const { data } = res;
                localStorage.setItem(`${data.user.role}Token`, data.token);
                setCurrentUser(data.user);

                toast.success("ავტორიზაცია შესრულდა", { position: "bottom-right", autoClose: 3000 });

                const redirectUrl = data.user.role === "admin" ? "/admin/panel/orders" : "/";
                window.location.href = redirectUrl;
            })
            .catch((err) => {
                if (err.inner) {
                    err.inner.forEach((e: any) => {
                        if (e.path) setErrors(e.path, e.message);
                        toast.error(e.message, { position: "bottom-right", autoClose: 3000 });
                    });
                } else {
                    toast.error("ავტორიზაცია ვერ შესრულდა", { position: "bottom-right", autoClose: 3000 });
                    setErrors("phone", "შეცდომა");
                    setErrors("password", "შეცდომა");
                }
            })
            .finally(() => setFormLoading(false));
    },

    // logout

    logout: () => {
        const { currentUser, setCurrentUser, setAuthLoading } = get();
        if (!currentUser) return;

        const role = currentUser.role as Role;
        const tokenKey = `${role}Token`;
        const token = localStorage.getItem(tokenKey);

        if (!token) {
            setCurrentUser(null);
            window.location.href = "/";
            return;
        }

        const axiosMap = {
            individual: axiosIndividual,
            company: axiosCompany,
            technician: axiosTechnician,
            admin: axiosAdmin,
        };
        const axiosInstance = axiosMap[role];

        setAuthLoading(true);

        axiosInstance.delete(`auth/${role}/logout`)
            .finally(() => {
                localStorage.removeItem(tokenKey);
                setCurrentUser(null);
                setAuthLoading(false);
                window.location.href = "/";
            });
    },

    // client

    rehydrateClient: () => {
        set({ authLoading: true });

        const individualToken = localStorage.getItem("individualToken");
        const companyToken = localStorage.getItem("companyToken");

        let axiosInstance;
        let role: Role | null = null;
        let token: string | null = null;

        if (individualToken) {
            axiosInstance = axiosIndividual;
            role = "individual";
            token = individualToken;
        } else if (companyToken) {
            axiosInstance = axiosCompany;
            role = "company";
            token = companyToken;
        }

        if (!token || !axiosInstance || !role) {
            if (window.location.pathname.startsWith("/dashboard")) {
                window.location.href = "/";
            }
            set({ authLoading: false, currentUser: null });
            return;
        }

        axiosInstance
            .get(`/${role}`)
            .then(({ data }) => {
                if (window.location.pathname.startsWith("/dashboard")) {
                    const pathRole = window.location.pathname.split("/")[2] as Role | undefined;
                    if (!pathRole || pathRole !== role) {
                        window.location.href = `/dashboard/${role}/${window.location.pathname.split("/")[3]}`;
                    }
                }
                set({ currentUser: data });
            })
            .catch(() => {
                localStorage.removeItem(`${role}Token`);
                set({ currentUser: null });
                window.location.href = "/auth/login";
            })
            .finally(() => {
                set({ authLoading: false });
            });
    },

    // admin

    rehydrateAdmin: () => {
        set({ authLoading: true });

        const adminToken = localStorage.getItem("adminToken");

        let axiosInstance;
        let role: Role | null = null;
        let token: string | null = null;

        if (adminToken) {
            axiosInstance = axiosAdmin;
            role = "admin";
            token = adminToken;
        }

        if (!token || !axiosInstance || !role) {
            if (window.location.pathname != "/admin") {
                window.location.href = "/admin";
            }
            set({ authLoading: false, currentUser: null });
            return;
        }

        axiosInstance
            .get(`/${role}`)
            .then(({ data }) => {
                set({ currentUser: data });

                if (window.location.pathname == "/admin") {
                    window.location.href = "/admin/panel/orders";
                }
            })
            .catch(() => {
                localStorage.removeItem(`${role}Token`);
                set({ currentUser: null });
                window.location.href = "/admin";
            })
            .finally(() => {
                set({ authLoading: false });
            });
    },
}));