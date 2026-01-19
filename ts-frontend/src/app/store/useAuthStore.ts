import { create } from "zustand";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { axiosAdmin, axiosCompany, axiosDelivery, axiosFront, axiosIndividual, axiosTechnician } from "../lib/api/axios";

type Role = "individual" | "company" | "technician" | "delivery" | "admin";

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

    login: (role: Role | "individualOrCompany", router?: any, pathname?: any) => void;
}

type AuthState = {
    currentUser: User | null;
    authLoading: boolean;
    openLogOut: boolean;
    setCurrentUser: (user: User | null) => void;
    toggleLogOut: () => void;
    setAuthLoading: (value: boolean) => void;

    logout: (router?: any) => void;
    rehydrate: (router?: any, pathname?: any) => void;
};

type Store = LoginState & AuthState;

const loginSchema = Yup.object().shape({
    phone: Yup.string()
        .matches(/^5\d{2} \d{3} \d{3}$/, "ნომერი უნდა დაიწყოს 5-ით და იყოს ფორმატში: 5** *** ***")
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

    login: (role: Role | "individualOrCompany", router?: any, pathname?: any) => {
        const { values, resetErrors, setErrors, setFormLoading, setCurrentUser, rehydrate } = get();
        const roles: Role[] = ["individual", "company", "technician", "delivery", "admin"];
        roles.forEach((r) => localStorage.removeItem(`${r}Token`));

        resetErrors();
        setFormLoading(true);

        loginSchema
            .validate(values, { abortEarly: false })
            .then(() => {
                const roleUrls: Record<string, string> = {
                    admin: "auth/admin/login",
                    individual: "auth/login-client",
                    company: "auth/login-client",
                    technician: "auth/technician/login",
                    delivery: "auth/delivery/login",
                };

                const url = roleUrls[role] || "auth/login-client";

                // Remove spaces from phone
                const payload = {
                    ...values,
                    phone: values.phone && values.phone.replace(/\s+/g, ""),
                };

                return axiosFront.post(url, payload);
            })
            .then((res) => {
                const { data } = res;
                localStorage.setItem(`${data.user.role}Token`, data.token);
                setCurrentUser(data.user);

                get().resetValues();
                get().resetErrors();

                toast.success("ავტორიზაცია შესრულდა", { position: "bottom-right", autoClose: 3000 });

                const roleRedirects: Record<string, string> = {
                    admin: "/admin/panel/main",
                    individual: "/",
                    company: "/",
                    technician: "/staff/technician/orders",
                    delivery: "/staff/delivery/orders",
                };

                router.push(roleRedirects[data.user.role] || "/");

                rehydrate(router, pathname);
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

    logout: (router?: any) => {
        const { currentUser, setCurrentUser, setAuthLoading } = get();
        if (!currentUser) return;

        const role = currentUser.role as Role;
        const tokenKey = `${role}Token`;
        const token = localStorage.getItem(tokenKey);

        if (!token) {
            setCurrentUser(null);
            router.push("/");
            return;
        }

        const axiosMap = {
            individual: axiosIndividual,
            company: axiosCompany,
            technician: axiosTechnician,
            delivery: axiosDelivery,
            admin: axiosAdmin,
        };
        const axiosInstance = axiosMap[role];

        setAuthLoading(true);

        axiosInstance.delete(`auth/${role}/logout`)
            .finally(() => {
                localStorage.removeItem(tokenKey);
                setCurrentUser(null);
                get().resetValues();
                get().resetErrors();
                setAuthLoading(false);
                router.push("/");
            });
    },

    // get user

    rehydrate: async (router?: any, pathname?: any) => {
        set({ authLoading: true });

        const tokenMap: Record<string, { token: string | null; axios: any }> = {
            individual: { token: localStorage.getItem("individualToken"), axios: axiosIndividual },
            company: { token: localStorage.getItem("companyToken"), axios: axiosCompany },
            technician: { token: localStorage.getItem("technicianToken"), axios: axiosTechnician },
            delivery: { token: localStorage.getItem("deliveryToken"), axios: axiosDelivery },
            admin: { token: localStorage.getItem("adminToken"), axios: axiosAdmin },
        };

        const activeRole = Object.keys(tokenMap).find(r => tokenMap[r].token);

        // --- Unauthorized users ---
        if (!activeRole) {
            if (pathname.startsWith("/admin/")) {
                router.push("/admin");
            } else if (pathname.startsWith("/staff/")) {
                router.push("/staff");
            } else if (pathname.startsWith("/dashboard")) {
                router.push("/");
            }

            set({ currentUser: null, authLoading: false });
            return;
        }

        if (activeRole == "admin" && !pathname.startsWith("/admin")) {
            set({ currentUser: null, authLoading: false });
            if (pathname.startsWith("/staff/")) {
                router.push("/staff");
            }
            if (pathname.startsWith("/dashboard")) {
                router.push("/");
            }
            return;
        }

        if ((activeRole == "technician" || activeRole == "delivery") && !pathname.startsWith("/staff")) {
            set({ currentUser: null, authLoading: false });
            if (pathname.startsWith("/admin/")) {
                router.push("/admin");
            }
            if (pathname.startsWith("/dashboard")) {
                router.push("/");
            }
            return;
        }

        if (activeRole == "company" && (pathname.startsWith("/staff") || pathname.startsWith("/admin"))) {
            set({ currentUser: null, authLoading: false });
            if (pathname.startsWith("/admin/")) {
                router.push("/admin");
            }
            if (pathname.startsWith("/staff/")) {
                router.push("/staff");
            }
            return;
        }

        if (activeRole) {
            const { axios } = tokenMap[activeRole];

            axios.get(`${activeRole}`)
                .then(({ data }: any) => {
                    set({ currentUser: data });

                    if (activeRole == "admin" && pathname === "/admin") {
                        router.push(`/admin/panel/main`)
                    }

                    if (activeRole !== "admin" && pathname.startsWith("/admin/")) {
                        router.push(`/admin`)
                    }

                    if ((activeRole == "company" || activeRole == "individual") && pathname.startsWith("/dashboard")) {
                        const section = pathname.split("/")[3] || "profile";
                        const subsection = pathname.split("/")[4] ? `/${pathname.split("/")[4]}` : "";
                        router.push(`/dashboard/${activeRole}/${section}/${subsection}`)
                    }

                    if ((activeRole == "technician" || activeRole == "delivery") && pathname.startsWith("/staff")) {
                        const section = pathname.split("/")[3] || "orders";
                        const subsection = pathname.split("/")[4] ? `/${pathname.split("/")[4]}` : "";
                        router.push(`/staff/${activeRole}/${section}/${subsection}`)
                    }

                    if ((activeRole !== "technician" && activeRole !== "delivery") && pathname.startsWith("/staff/")) {
                        router.push(`/staff`)
                    }
                })
                .catch(() => {
                    localStorage.removeItem(`${activeRole}Token`);
                    set({ currentUser: null });
                })
                .finally(() => {
                    set({ authLoading: false });
                });
        }
    },
}));