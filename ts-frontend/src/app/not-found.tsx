"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "./store/useAuthStore";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-[100px] font-bold text-gray-300">404</h1>
      <h2 className="text-[28px] sm:text-[36px] font-semibold text-myGray mt-4">
        გვერდი ვერ მოიძებნა
      </h2>
      <p className="text-myLightGray mt-2 text-center max-w-[400px]">
        გვერდი რომელსაც ეძებ არ არსებობს.
      </p>
      <Button
        className="cursor-pointer mt-6"
        onClick={() => {
          router.push("/");
          setCurrentUser(null);
        }}
      >
        მთავარი გვერდი
      </Button>
    </div>
  );
}
