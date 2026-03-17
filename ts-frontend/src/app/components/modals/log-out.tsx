"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { api } from "@/app/lib/api/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLogOutStore } from "@/app/store/useLogOutStore";
import { Loader2Icon } from "lucide-react";

export default function LogOut() {
  const router = useRouter();
  const { openLogOut, toggleLogOut } = useLogOutStore();

  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("auth/logout");
    },

    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      toast.success("წარმატებით გამოხვედით სისტემიდან");

      toggleLogOut();
      router.push("/");
    },

    onError: () => {
      toast.error("გასვლა ვერ შესრულდა");
    },
  });

  return (
    <div
      className={`${
        openLogOut ? "" : "opacity-0 pointer-events-none"
      } fixed inset-0 z-30 flex items-center justify-center`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          openLogOut ? "opacity-50" : "opacity-0"
        }`}
        onClick={toggleLogOut} // closes when clicking outside
      ></div>

      <div
        className={`bg-white rounded-[20px] sm:rounded-[30px] shadow-lg p-6 z-[22] transition-transform duration-200 ${
          openLogOut ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-lg mb-4">ნამდვილად გსურს გასვლა?</h2>
        <div className="flex gap-3 justify-end">
          <Button
            onClick={toggleLogOut}
            variant="outline"
            className="cursor-pointer"
          >
            არა
          </Button>
          <Button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="px-6 bg-red-600 hover:bg-[#b91c1c] text-white cursor-pointer"
          >
            {logoutMutation.isPending && (
              <Loader2Icon className="animate-spin" />
            )}
            კი
          </Button>
        </div>
      </div>
    </div>
  );
}
