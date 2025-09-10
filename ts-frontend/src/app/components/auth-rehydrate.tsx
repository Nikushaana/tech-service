"use client";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { usePathname } from "next/navigation";

export default function AuthRehydrate() {
  const pathname = usePathname();

  const rehydrateClient = useAuthStore((state) => state.rehydrateClient);
  const rehydrateAdmin = useAuthStore((state) => state.rehydrateAdmin);

  useEffect(() => {
    rehydrateClient();
  }, [rehydrateClient]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) rehydrateAdmin();
  }, [rehydrateAdmin]);

  return null;
}
