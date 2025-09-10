"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { useAuthStore } from "@/app/store/useAuthStore";
import FormInput from "@/app/components/inputs/form-input";
import { Loader2Icon } from "lucide-react";

export default function Login() {
  const router = useRouter();

  const { values, setValues, errors, formLoading, login } = useAuthStore();

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
        onClick={() => login("individualOrCompany")}
        disabled={formLoading}
        className="h-11 cursor-pointer"
      >
        {formLoading && <Loader2Icon className="animate-spin" />}შესვლა
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
