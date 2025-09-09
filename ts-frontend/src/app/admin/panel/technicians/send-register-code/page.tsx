"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { useRegisterStore } from "@/app/store/registerStore";
import FormInput from "@/app/components/inputs/form-input";
import { axiosAdmin } from "@/app/api/axios";
import { toast } from "react-toastify";
import { sendCodeSchema } from "@/app/utils/validation";
import { Loader2Icon } from "lucide-react";

export default function SendAdminTechnicianRegisterCode() {
  const router = useRouter();
  const {
    values,
    setValues,
    errors,
    setErrors,
    resetErrors,
    loading,
    setLoading,
  } = useRegisterStore();

  const handleSendAdminTechnicianRegisterCode = async () => {
    setLoading(true);
    try {
      // Yup validation
      resetErrors();
      await sendCodeSchema.validate(values, { abortEarly: false });

      axiosAdmin
        .post(`auth/technician/send-register-code`, {
          phone: values.phone,
        })
        .then((res) => {
          router.push("/admin/panel/technicians/verify-register-code");

          setValues("testcode", res.data.code);

          toast.success("კოდი გამოიგზავნა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          resetErrors();
        })
        .catch((error) => {
          if (error.response.data.message === "Phone already used") {
            toast.error("ტელეფონის ნომერი გამოყენებულია", {
              position: "bottom-right",
              autoClose: 3000,
            });
          } else {
            toast.error("კოდი ვერ გამოიგზავნა", {
              position: "bottom-right",
              autoClose: 3000,
            });
          }

          setErrors("phone", "შეცდომა");
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
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col self-start items-center p-[10px] rounded-xl shadow gap-y-5 relative w-full max-w-lg mx-auto bg-white">
      <h1 className="text-center text-xl sm:text-2xl font-semibold">
        ტექნიკოსის რეგისტრაცია
      </h1>
      <p className="text-center text-sm">
        Tech Service-ში ტექნიკოსის რეგისტრაციისთვის საჭიროა ნომრის დადასტურება
        ვალიდური კოდით
      </p>

      <FormInput
        id="phone"
        value={values.phone || ""}
        onChange={(e) => setValues("phone", e.target.value)}
        label="ტელეფონის ნომერი"
        error={errors.phone}
      />

      <Button
        onClick={() => {
          handleSendAdminTechnicianRegisterCode();
        }}
        disabled={loading}
        className="h-11 cursor-pointer"
      >
        {loading && <Loader2Icon className="animate-spin" />}კოდის გაგზავნა
      </Button>
    </div>
  );
}
