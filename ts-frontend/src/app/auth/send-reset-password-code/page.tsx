"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import FormInput from "@/app/components/inputs/form-input";
import { useResetPasswordStore } from "@/app/store/resetPasswordStore";
import { axiosFront } from "@/app/api/axios";
import { toast } from "react-toastify";
import { sendCodeSchema } from "@/app/utils/validation";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";

export default function SendResetPasswordCode() {
  const router = useRouter();
  const {
    values,
    setValues,
    errors,
    setErrors,
    resetErrors,
    loading,
    setLoading,
  } = useResetPasswordStore();

  const handleSendResetPasswordCode = async () => {
    setLoading(true);
    try {
      // Yup validation
      resetErrors();
      await sendCodeSchema.validate(values, { abortEarly: false });

      axiosFront
        .post(`auth/send-reset-password-code`, {
          phone: values.phone,
        })
        .then((res) => {
          router.push("/auth/reset-password");

          setValues("testcode", res.data.code);

          toast.success("კოდი გამოიგზავნა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          resetErrors();
        })
        .catch((error) => {
          if (error.response.data.message === "User not found") {
            toast.error("მომხმარებელი ვერ მოიძებნა", {
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
    <div className="w-full flex flex-col gap-y-5 relative">
      <h1 className="text-center text-xl sm:text-2xl font-semibold">
        პაროლის განახლება
      </h1>
      <p className="text-center text-sm">
        პაროლის გასანახლებლად საჭიროა რეგისტრირებული ნომრის დადასტურება ვალიდური
        კოდით
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
          handleSendResetPasswordCode();
        }}
        disabled={loading}
        className="h-11 cursor-pointer"
      >
        {loading && <Loader2Icon className="animate-spin" />}კოდის გაგზავნა
      </Button>

      {/* Footer link */}
      <Link
        href={"/auth/login"}
        className="absolute bottom-[-95px] self-center mt-3 z-10"
      >
        <p className="text-center border-b-[1px] border-transparent hover:border-gray-700 text-sm text-stroke">
          გაქვს ანგარიში? - გაიარე ავტორიზაცია
        </p>
      </Link>
    </div>
  );
}
