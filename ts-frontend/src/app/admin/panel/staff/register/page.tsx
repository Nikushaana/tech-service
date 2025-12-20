"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRegisterStore } from "@/app/store/registerStore";
import { axiosAdmin } from "@/app/api/axios";
import { toast } from "react-toastify";
import { registerSchema } from "@/app/utils/validation";
import FormInput from "@/app/components/inputs/form-input";
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminStaffRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    values,
    setValues,
    errors,
    setErrors,
    resetErrors,
    loading,
    setLoading,
  } = useRegisterStore();

  useEffect(() => {
    if (!values.role) {
      router.push("/admin/panel/staff");
    }
  }, [values.role, router]);


  const handleAdminStaffRegister = async () => {
    setLoading(true);
    try {
      // Yup validation
      resetErrors();
      await registerSchema.validate(values, { abortEarly: false });

      let payload: any = {
        phone: values.phone,
        password: values.password,
        name: values.name,
        lastName: values.lastName,
      };

      axiosAdmin
        .post(`auth/${values.role == "technician" ? "technician" : "delivery"}/register`, payload)
        .then((res) => {
          router.push("/admin/panel/staff");

          toast.success(
            `${values.role == "technician" ? "ტექნიკოსი" : "კურიერი"} ${
              res.data.user.name
            } წარმატებით დარეგისტრირდა`,
            { position: "bottom-right", autoClose: 3000 }
          );

          // refresh staff list
      queryClient.invalidateQueries({
        queryKey: ["adminStaff"],
      });

          resetErrors();
        })
        .catch((error) => {
          toast.error("რეგისტრაცია ვერ მოხდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          Object.keys(payload).forEach((key) => {
            setErrors(key, "შეცდომა");
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err: any) {
      // Yup validation errors
      if (err.inner) {
        err.inner.forEach((e: any) => {
          if (e.path) {
            setErrors(e.path, e.message);
            toast.error(e.message, {
              position: "bottom-right",
              autoClose: 3000,
            });
          }

          if (e.path === "phone") {
            router.push("/admin/panel/staff");
          }
        });
      }
      setLoading(false);
    }
  };

  if (!values.role) {
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col self-start items-center p-[10px] rounded-xl shadow border border-gray-200 gap-y-5 relative max-w-lg mx-auto bg-white">
      <h1 className="text-center text-xl sm:text-2xl font-semibold">
        Tech Service-ში{" "}
        {values.role == "technician" ? "ტექნიკოსის" : "კურიერის"} რეგისტრაცია
      </h1>

      <FormInput
        id="name"
        value={values.name || ""}
        onChange={(e) => setValues("name", e.target.value)}
        label="სახელი"
        error={errors.name}
      />
      <FormInput
        id="lastName"
        value={values.lastName || ""}
        onChange={(e) => setValues("lastName", e.target.value)}
        label="გვარი"
        error={errors.lastName}
      />

      <FormInput
        id="password"
        value={values.password || ""}
        onChange={(e) => setValues("password", e.target.value)}
        label="პაროლი"
        type="password"
        error={errors.password}
      />
      <FormInput
        id="repeatPassword"
        value={values.repeatPassword || ""}
        onChange={(e) => setValues("repeatPassword", e.target.value)}
        label="გაიმეორე პაროლი"
        type="password"
        error={errors.repeatPassword}
      />

      <Button
        onClick={() => {
          handleAdminStaffRegister();
        }}
        disabled={loading}
        className="h-11 cursor-pointer"
      >
        რეგისტრაცია
      </Button>
    </div>
  );
}
