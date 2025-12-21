"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRegisterStore } from "@/app/store/registerStore";
import { axiosFront } from "@/app/api/axios";
import { toast } from "react-toastify";
import { registerSchema } from "@/app/utils/validation";
import FormInput from "@/app/components/inputs/form-input";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export default function Register() {
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

  useEffect(() => {
    setValues("role", "individual");
  }, []);

  const handleRegister = async () => {
    setLoading(true);
    try {
      // Yup validation
      resetErrors();
      await registerSchema.validate(values, { abortEarly: false });

      let payload: any = {
        phone: values.phone,
        password: values.password,
      };

      if (values.role === "individual") {
        payload = {
          ...payload,
          name: values.name,
          lastName: values.lastName,
        };
      } else if (values.role === "company") {
        payload = {
          ...payload,
          companyAgentName: values.companyAgentName,
          companyAgentLastName: values.companyAgentLastName,
          companyName: values.companyName,
          companyIdentificationCode: values.companyIdentificationCode,
        };
      }

      const url =
        values.role === "individual"
          ? "auth/individual/register"
          : "auth/company/register";

      axiosFront
        .post(url, payload)
        .then((res) => {
          router.push("/auth/login");
          resetValues();

          toast.success(
            `${
              res.data.user.name ? `ფიზიკური პირი` : `იურიდიული პირი`
            } წარმატებით დარეგისტრირდა`,
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
        Tech Service-ში რეგისტრაცია
      </h1>

      <div className="flex gap-6 items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={values.role === "individual"}
            onCheckedChange={() => setValues("role", "individual")}
          />
          <p>ფიზიკური პირი</p>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={values.role === "company"}
            onCheckedChange={() => setValues("role", "company")}
          />
          <p>იურიდიული პირი</p>
        </label>
      </div>
      {values.role === "individual" ? (
        <>
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
        </>
      ) : (
        <>
          <FormInput
            id="companyAgentName"
            value={values.companyAgentName || ""}
            onChange={(e) => setValues("companyAgentName", e.target.value)}
            label="კომპანიის წარმომადგენლის სახელი"
            error={errors.companyAgentName}
          />
          <FormInput
            id="companyAgentLastName"
            value={values.companyAgentLastName || ""}
            onChange={(e) => setValues("companyAgentLastName", e.target.value)}
            label="კომპანიის წარმომადგენლის გვარი"
            error={errors.companyAgentLastName}
          />
          <FormInput
            id="companyName"
            value={values.companyName || ""}
            onChange={(e) => setValues("companyName", e.target.value)}
            label="კომპანიის სახელი"
            error={errors.companyName}
          />
          <FormInput
            id="companyIdentificationCode"
            value={values.companyIdentificationCode || ""}
            onChange={(e) =>
              setValues("companyIdentificationCode", e.target.value)
            }
            label="კომპანიის საიდენტიფიკაციო კოდი"
            error={errors.companyIdentificationCode}
          />
        </>
      )}

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
          handleRegister();
        }}
        disabled={loading}
        className="h-11 cursor-pointer"
      >
        {loading && <Loader2Icon className="animate-spin" />}რეგისტრაცია
      </Button>

      {/* Footer link */}
      <Link
        href={"/auth/login"}
        className="absolute bottom-[-95px] self-center mt-3 z-10"
      >
        <p className="text-center cursor-pointer border-b-[1px] border-transparent hover:border-gray-700 text-sm text-stroke">
          გაქვს ანგარიში? - გაიარე ავტორიზაცია
        </p>
      </Link>
    </div>
  );
}
