"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useRegisterStore } from "@/app/store/registerStore";
import { axiosAdmin } from "@/app/api/axios";
import { toast } from "react-toastify";
import { registerSchema } from "@/app/utils/validation";
import FormInput from "@/app/components/inputs/form-input";
import { Loader2Icon } from "lucide-react";

export default function AdminTechnicianRegister() {
  const router = useRouter();
  const {
    values,
    setValues,
    resetValues,
    errors,
    setErrors,
    resetErrors,
    loading,
    setLoading,
  } = useRegisterStore();

  const handleAdminTechnicianRegister = async () => {
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
        .post(`auth/technician/register`, payload)
        .then((res) => {
          router.push("/admin/panel/technicians");
          resetValues();

          toast.success(
            `ტექნიკოსი ${res.data.user.name} წარმატებით დარეგისტრირდა`,
            { position: "bottom-right", autoClose: 3000 }
          );

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
            router.push("/admin/panel/technicians/send-register-code");
          }
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col self-start items-center p-[10px] rounded-xl shadow gap-y-5 relative max-w-lg mx-auto bg-white">
      <h1 className="text-center text-xl sm:text-2xl font-semibold">
        Tech Service-ში ტექნიკოსის რეგისტრაცია
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
          handleAdminTechnicianRegister();
        }}
        disabled={loading}
        className="h-11 cursor-pointer"
      >
        {loading && <Loader2Icon className="animate-spin" />}რეგისტრაცია
      </Button>
    </div>
  );
}
