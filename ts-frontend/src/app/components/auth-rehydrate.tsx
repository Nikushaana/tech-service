"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function AuthRehydrate() {
  const rehydrate = useAuthStore((state) => state.rehydrate);

  useEffect(() => {
    rehydrate();
  }, []);

  return null;
}
