"use client";

import { useAuthStore } from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LogOut() {
  const router = useRouter();
  const { openLogOut, toggleLogOut, logout } = useAuthStore();

  return (
    <div
      className={`${
        openLogOut ? "" : "opacity-0 pointer-events-none"
      } fixed inset-0 z-20 flex items-center justify-center`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          openLogOut ? "opacity-50" : "opacity-0"
        }`}
        onClick={toggleLogOut} // closes when clicking outside
      ></div>

      <div
        className={`bg-white rounded-2xl shadow-lg p-6 z-[22] transition-transform duration-200 ${
          openLogOut ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4">ნამდვილად გსურს გასვლა?</h2>
        <div className="flex gap-3 justify-end">
          <Button
            onClick={toggleLogOut}
            className="h-[45px] px-6 cursor-pointer"
          >
            არა
          </Button>
          <Button
            onClick={() => {
              logout(router), toggleLogOut();
            }}
            className="h-[45px] px-6 bg-red-600 hover:bg-[#b91c1c] text-white cursor-pointer"
          >
            კი
          </Button>
        </div>
      </div>
    </div>
  );
}
