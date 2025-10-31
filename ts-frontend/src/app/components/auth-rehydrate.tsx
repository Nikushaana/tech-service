"use client";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { usePathname, useRouter } from "next/navigation";

export default function AuthRehydrate() {
  const router = useRouter();
  const pathname = usePathname();

  const rehydrateClient = useAuthStore((state) => state.rehydrateClient);
  const rehydrateAdmin = useAuthStore((state) => state.rehydrateAdmin);

  useEffect(() => {
    rehydrateClient(router);
  }, [rehydrateClient, router]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) rehydrateAdmin(router);
  }, [rehydrateAdmin, pathname, router]);

  return null;
}
