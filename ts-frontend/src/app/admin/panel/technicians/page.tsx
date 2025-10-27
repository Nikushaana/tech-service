"use client";

import { axiosAdmin } from "@/app/api/axios";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { Button } from "@/app/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BsPen } from "react-icons/bs";
import { toast } from "react-toastify";
import * as Yup from "yup";

export default function Page() {
  const router = useRouter();

  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTechnicians = () => {
    setLoading(true);
    axiosAdmin
      .get("/admin/technicians")
      .then(({ data }) => setTechnicians(data))
      .catch((err) => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  return (
    <div className="flex flex-col items-center gap-y-[20px] w-full">
      <Button
        onClick={() => {
          router.push("/admin/panel/technicians/send-register-code");
        }}
        className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto self-end"
      >
        ტექნიკოსის რეგისტრაცია
      </Button>
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        technicians.map((technician) => (
          <div
            key={technician.id}
            className="w-full p-4 border rounded-xl shadow-sm bg-white flex items-center justify-between"
          >
            <div className="flex items-center gap-[10px]">
              <img
                src={
                  (technician.images && technician.images[0]) ||
                  "/images/logo.png"
                }
                alt={technician.name}
                className="aspect-square object-cover rounded-full w-[40px]"
              />
              <p>{technician.name + " " + technician.lastName}</p>
            </div>
            <div className="flex items-center gap-[10px]">
              <p className="text-sm">
                {technician.status ? "აქტიური" : "დაბლოკილი"}
              </p>
              <Button
                onClick={() => {
                  router.push(`/admin/panel/technicians/${technician.id}`);
                }}
                className="bg-[gray] hover:bg-[#696767] text-[20px] cursor-pointer"
              >
                <BsPen />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
