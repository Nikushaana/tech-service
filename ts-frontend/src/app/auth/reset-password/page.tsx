"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import FormInput from "@/app/components/inputs/form-input";
import { useResetPasswordStore } from "@/app/store/resetPasswordStore";
import { toast } from "react-toastify";
import { verifyCodePasswordResetSchema } from "@/app/utils/validation";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { axiosFront } from "@/app/lib/api/axios";

export default function SendResetPasswordCode() {
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
  } = useResetPasswordStore();

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      // Yup validation
      resetErrors();
      await verifyCodePasswordResetSchema.validate(values, {
        abortEarly: false,
      });

      axiosFront
        .post(`auth/reset-password`, {
          phone: values.phone && values.phone.replace(/\s+/g, ""),
          code: values.code,
          newPassword: values.newPassword,
        })
        .then((res) => {
          router.push("/auth/login");
          resetValues();

          toast.success("პაროლი განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });
        })
        .catch((error) => {
          error.response.data.message === "Invalid code"
            ? toast.error("კოდი არასწორია", {
                position: "bottom-right",
                autoClose: 3000,
              })
            : toast.error("პაროლი ვერ განახლდა", {
                position: "bottom-right",
                autoClose: 3000,
              });
        })
        .finally(() => {
          setLoading(true);
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
      setLoading(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-y-5 relative">
      <h1 className="text-center text-xl sm:text-2xl font-semibold">
        პაროლის განახლება
      </h1>
      <p className="text-center text-sm">
        პაროლის გასანახლებლად ჩაწერეთ ნომერზე გამოგზავნილი კოდი და ახალი პაროლი
      </p>
      <p>{values.testcode}</p>
      <FormInput
        id="code"
        value={values.code || ""}
        onChange={(e) => setValues("code", e.target.value)}
        label="კოდი"
         type="tel"
        error={errors.code}
      />
      <FormInput
        id="newPassword"
        value={values.newPassword || ""}
        onChange={(e) => setValues("newPassword", e.target.value)}
        label="ახალი პაროლი"
        type="password"
        error={errors.newPassword}
      />
      <FormInput
        id="repeatNewPassword"
        value={values.repeatNewPassword || ""}
        onChange={(e) => setValues("repeatNewPassword", e.target.value)}
        label="გაიმეორე ახალი პაროლი"
        type="password"
        error={errors.repeatNewPassword}
      />

      <Button
        onClick={() => {
          handleResetPassword();
        }}
        disabled={loading}
        className="h-11 cursor-pointer"
      >
        {loading && <Loader2Icon className="animate-spin" />}განახლება
      </Button>

      {/* Footer link */}
      <Link
        href={"/auth/login"}
        className="absolute bottom-[-95px] self-center mt-3 z-10"
      >
      <p
        className="text-center cursor-pointer border-b-[1px] border-transparent hover:border-gray-700 text-sm text-stroke"
      >
        გაქვს ანგარიში? - გაიარე ავტორიზაცია
      </p>
      </Link>
    </div>
  );
}
