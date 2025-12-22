"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store/useAuthStore";
import FormInput from "@/app/components/inputs/form-input";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { formatPhone } from "@/app/utils/phone";

export default function Login() {
  const router = useRouter();
  const pathname = usePathname();

  const { values, setValues, errors, formLoading, login } = useAuthStore();

  return (
    <div className="w-full flex flex-col gap-y-5 relative">
      <h1 className="text-center text-xl sm:text-2xl font-semibold">
        Tech Service-ში შესვლა
      </h1>
      <FormInput
        id="phone"
        value={values.phone || ""}
        onChange={(e) => setValues("phone", formatPhone(e.target.value))}
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

      <Link href={"/auth/send-reset-password-code"} className="self-end">
        <p className="hover:underline text-sm">დაგავიწყდა პაროლი?</p>
      </Link>

      <Button
        onClick={() => login("individualOrCompany", router, pathname)}
        disabled={formLoading}
        className="h-11 cursor-pointer"
      >
        {formLoading && <Loader2Icon className="animate-spin" />}შესვლა
      </Button>

      {/* Footer link */}
      <Link
        href={"/auth/send-register-code"}
        className="absolute bottom-[-95px] z-10 self-center text-center mt-3"
      >
        <p className="border-b-[1px] border-transparent hover:border-gray-700 text-sm text-stroke">
          არ გაქვს ანგარიში? - გაიარე რეგისტრაცია
        </p>
      </Link>
    </div>
  );
}
