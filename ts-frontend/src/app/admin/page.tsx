"use client";

import { usePathname, useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import FormInput from "../components/inputs/form-input";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "@/components/ui/button";

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();

  const { values, setValues, errors, formLoading, login } = useAuthStore();

  return (
    <div className="flex flex-col gap-y-5 items-center justify-center h-screen px-4">
      <div className="rounded-xl bg-gray-100 border-[1px] w-full max-w-sm sm:max-w-md md:max-w-lg p-6 sm:p-10 shadow-2xl flex flex-col gap-y-5">
        <img
          onClick={() => {
            router.push("/");
          }}
          src="/images/logo.png"
          alt="logo"
          className="h-[60px] object-contain cursor-pointer self-center"
        />

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

        <Button
          onClick={() => {
            login("admin", router, pathname);
          }}
          disabled={formLoading}
          className="h-11 cursor-pointer"
        >
          {formLoading && <Loader2Icon className="animate-spin" />}შესვლა
        </Button>
      </div>
    </div>
  );
}
