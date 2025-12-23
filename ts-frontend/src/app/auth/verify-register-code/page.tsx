"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRegisterStore } from "@/app/store/registerStore";
import FormInput from "@/app/components/inputs/form-input";
import { axiosFront } from "@/app/api/axios";
import { toast } from "react-toastify";
import { verifyCodeSchema } from "@/app/utils/validation";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";

export default function VerifyRegisterCode() {
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

  const handleVerifyRegisterCode = async () => {
    setLoading(true);
    try {
      // Yup validation
      resetErrors();
      await verifyCodeSchema.validate(values, { abortEarly: false });

      axiosFront
        .post(`auth/verify-register-code`, {
          phone: values.phone && values.phone.replace(/\s+/g, ""),
          code: values.code,
        })
        .then((res) => {
          router.push("/auth/register");

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
            router.push("/auth/send-register-code");
          }
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-y-5 relative">
      <h1 className="text-center text-xl sm:text-2xl font-semibold">
        რეგისტრაცია
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
         type="tel"
        error={errors.code}
      />

      <Button
        onClick={() => {
          handleVerifyRegisterCode();
        }}
        disabled={loading}
        className="h-11 cursor-pointer"
      >
        {loading && <Loader2Icon className="animate-spin" />}შემოწმება
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
