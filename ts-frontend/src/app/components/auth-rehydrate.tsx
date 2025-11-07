"use client";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { usePathname, useRouter } from "next/navigation";

export default function AuthRehydrate() {
  const router = useRouter();
  const pathname = usePathname();

  const rehydrate = useAuthStore((state) => state.rehydrate);

  useEffect(() => {
    rehydrate(router, pathname);
  }, [rehydrate]);

  return null;
}
