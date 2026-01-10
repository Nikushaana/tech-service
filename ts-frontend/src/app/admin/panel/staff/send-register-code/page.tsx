"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRegisterStore } from "@/app/store/registerStore";
import FormInput from "@/app/components/inputs/form-input";
import { axiosAdmin } from "@/app/api/axios";
import { toast } from "react-toastify";
import { sendCodeSchema } from "@/app/utils/validation";
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { formatPhone } from "@/app/utils/formatPhone";

export default function SendAdminStaffRegisterCode() {
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

  useEffect(() => {
    if (!values.role) {
      router.push("/admin/panel/staff");
    }
  }, [values.role, router]);

  const handleSendAdminStaffRegisterCode = async () => {
    setLoading(true);
    try {
      // Yup validation
      resetErrors();
      await sendCodeSchema.validate(values, { abortEarly: false });

      axiosAdmin
        .post(
          `auth/${
            values.role == "technician" ? "technician" : "delivery"
          }/send-register-code`,
          {
            phone: values.phone && values.phone.replace(/\s+/g, ""),
          }
        )
        .then((res) => {
          router.push("/admin/panel/staff/verify-register-code");

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

  if (!values.role) {
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col self-start items-center p-[10px] rounded-xl shadow border border-gray-200 gap-y-5 relative w-full max-w-lg mx-auto bg-white">
      <h1 className="text-center text-xl sm:text-2xl font-semibold">
        {values.role == "technician" ? "ტექნიკოსის" : "კურიერის"} რეგისტრაცია
      </h1>
      <p className="text-center text-sm">
        Tech Service-ში{" "}
        {values.role == "technician" ? "ტექნიკოსის" : "კურიერის"}{" "}
        რეგისტრაციისთვის საჭიროა ნომრის დადასტურება ვალიდური კოდით
      </p>

      <FormInput
        id="phone"
        value={values.phone || ""}
        onChange={(e) => setValues("phone", formatPhone(e.target.value))}
        label="ტელეფონის ნომერი"
        type="tel"
        error={errors.phone}
      />

      <Button
        onClick={() => {
          handleSendAdminStaffRegisterCode();
        }}
        disabled={loading}
        className="h-11 cursor-pointer"
      >
        {loading && <Loader2Icon className="animate-spin" />}კოდის გაგზავნა
      </Button>
    </div>
  );
}
