"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { useLoginStore } from "@/app/store/loginStore";
import { axiosFront } from "@/app/api/axios";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useAuthStore } from "@/app/store/useAuthStore";
import FormInput from "@/app/components/inputs/form-input";
import { Loader2Icon } from "lucide-react";

export default function Login() {
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
  } = useLoginStore();

  const { login } = useAuthStore();

  // Yup validation schema
  const loginSchema = Yup.object().shape({
    phone: Yup.string()
      .matches(/^5\d{8}$/, "ნომერი უნდა დაიწყოს 5-ით და იყოს 9 ციფრი")
      .required("ტელეფონის ნომერი აუცილებელია"),
    password: Yup.string().required("პაროლი აუცილებელია"),
  });

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Yup validation
      resetErrors();
      await loginSchema.validate(values, { abortEarly: false });

      axiosFront
        .post(`auth/login`, {
          phone: values.phone,
          password: values.password,
        })
        .then((res) => {
          router.push("/");
          resetValues();

          toast.success("ავტორიზაცია შესრულდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          resetErrors();

          // Save user and token in store
          const role = res.data.user.role; // "individual" | "company" | "technician"
          const token = res.data.token;

          login(role, token); // single method handles setting currentUser & localStorage
        })
        .catch((error) => {
          toast.error("ავტორიზაცია ვერ შესრულდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          setErrors("phone", "შეცდომა");
          setErrors("password", "შეცდომა");
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
        Tech Service-ში შესვლა
      </h1>
      <FormInput
        id="phone"
        value={values.phone || ""}
        onChange={(e) => setValues("phone", e.target.value)}
        label="ტელეფონის ნომერი"
        error={errors.phone}
      />
      <FormInput
        id="password"
        value={values.password || ""}
        onChange={(e) => setValues("password", e.target.value)}
        label="პაროლი"
        type="password"
        error={errors.password}
      />

      <p
        onClick={() => {
          router.push("/auth/send-reset-password-code");
        }}
        className="self-end cursor-pointer hover:underline text-sm"
      >
        დაგავიწყდა პაროლი?
      </p>

      <Button
        onClick={() => {
          handleLogin();
        }}
        disabled={loading}
        className="h-11 cursor-pointer"
      >
        {loading && <Loader2Icon className="animate-spin" />}შესვლა
      </Button>

      {/* Footer link */}
      <p
        onClick={() => {
          router.push("/auth/send-register-code");
        }}
        className="absolute bottom-[-95px] self-center text-center cursor-pointer border-b-[1px] border-transparent hover:border-gray-700 text-sm  mt-3 z-10 text-stroke"
      >
        არ გაქვს ანგარიში? - გაიარე რეგისტრაცია
      </p>
    </div>
  );
}
