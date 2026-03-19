import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/lib/api/axios";
import { toast } from "react-toastify";
import { loginSchema } from "@/app/utils/validation";
import { usePathname } from "next/navigation";
import { useOrdersStore } from "../store/useOrdersStore";

export function useLogin() {
  const pathname = usePathname()
  const queryClient = useQueryClient();
  const { toggleOpenCreateOrderModal } = useOrdersStore();

  const [values, setValues] = useState({ phone: "", password: "" });
  const [errors, setErrors] = useState({ phone: "", password: "" });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const payload = { phone: values.phone.replace(/\s+/g, ""), password: values.password };
      const res = await api.post("auth/login", payload);
      return res.data;
    },
    onSuccess: async (data) => {
      const role = data.user.role;

      const getAllowedRoles = (pathname: string) => {
        if (pathname.startsWith("/admin")) return ["admin"];
        if (pathname.startsWith("/staff")) return ["delivery", "technician"];
        if (pathname.startsWith("/auth")) return ["company", "individual"];
        return null;
      };

      const allowedRoles = getAllowedRoles(pathname);

      if (!allowedRoles || !allowedRoles.includes(role)) {
        await api.post("auth/logout");

        queryClient.invalidateQueries({
          queryKey: ["currentUser"],
        });

        toast.error("თქვენ არ გაქვთ წვდომა ამ პანელზე");

        return;
      }

      const roleRedirectMap: Record<string, string> = {
        admin: "/admin/panel/main",
        technician: "/staff/technician/orders",
        delivery: "/staff/delivery/orders",
        company: "/dashboard/company/profile",
        individual: "/dashboard/individual/profile",
      };

      toast.success("ავტორიზაცია შესრულდა");

      // router.replace(roleRedirectMap[role]);

      const pendingOrder = sessionStorage.getItem("pendingTecheroOrder");

      if (pendingOrder)
        toggleOpenCreateOrderModal()

      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });

      setValues({ phone: "", password: "" });
      setErrors({ phone: "", password: "" });
    },
    onError: () => toast.error("ავტორიზაცია ვერ შესრულდა"),
    retry: false,
  });

  const handleLogin = async () => {
    setErrors({ phone: "", password: "" });
    try {
      await loginSchema.validate(values, { abortEarly: false });
      loginMutation.mutate();
    } catch (err: any) {
      if (err.inner) {
        err.inner.forEach((e: any) => {
          if (e.path) setErrors((prev) => ({ ...prev, [e.path]: e.message }));
          toast.error(e.message);
        });
      }
    }
  };

  return { values, setValues, errors, setErrors, loginMutation, handleLogin };
}