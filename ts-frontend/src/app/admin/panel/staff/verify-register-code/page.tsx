"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRegisterStore } from "@/app/store/registerStore";
import FormInput from "@/app/components/inputs/form-input";
import { axiosAdmin } from "@/app/api/axios";
import { toast } from "react-toastify";
import { verifyCodeSchema } from "@/app/utils/validation";
import { Loader2Icon } from "lucide-react";

export default function VerifyAdminStaffRegisterCode() {
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

  const handleVerifyAdminStaffRegisterCode = async () => {
    setLoading(true);
    try {
      // Yup validation
      resetErrors();
      await verifyCodeSchema.validate(values, { abortEarly: false });

      axiosAdmin
        .post(
          `auth/${
            values.role == "technician" ? "technician" : "delivery"
          }/verify-register-code`,
          {
            phone: values.phone && values.phone.replace(/\s+/g, ""),
            code: values.code,
          }
        )
        .then((res) => {
          router.push("/admin/panel/staff/register");

          toast.success("ტელეფონის ნომერი დადასტურდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          resetErrors();
        })
        .catch((error) => {
          toast.error("ტელეფონის ნომერი ვერ დადასტურდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          setErrors("code", "შეცდომა");
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
    <div className="flex flex-col self-start items-center p-[10px] rounded-xl shadow border border-gray-200 gap-y-5 relative w-full max-w-lg mx-auto bg-white">
      <h1 className="text-center text-xl sm:text-2xl font-semibold">
        {values.role == "technician" ? "ტექნიკოსის" : "კურიერის"} რეგისტრაცია
      </h1>
      <p className="text-center text-sm">
        შეიყვანე ტელეფონის ნომერზე გამოგზავნილი კოდი
      </p>
      <p>{values.testcode}</p>
      <FormInput
        id="code"
        value={values.code || ""}
        onChange={(e) => setValues("code", e.target.value)}
        label="კოდი"
        error={errors.code}
      />

      <Button
        onClick={() => {
          handleVerifyAdminStaffRegisterCode();
        }}
        disabled={loading}
        className="h-11 cursor-pointer"
      >
        {loading && <Loader2Icon className="animate-spin" />} შემოწმება
      </Button>
    </div>
  );
}
