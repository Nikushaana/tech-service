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

  const [individuals, setIndividuals] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIndividuals = () => {
    setLoading(true);
    axiosAdmin
      .get("/admin/individuals")
      .then(({ data }) => setIndividuals(data))
      .catch((err) => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIndividuals();
  }, []);

  return (
    <div className="flex flex-col items-center gap-y-[20px] w-full">
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        individuals.map((individual) => (
          <div
            key={individual.id}
            className="w-full p-4 border rounded-xl shadow-sm bg-white flex items-center justify-between"
          >
            <p>{individual.name + " " + individual.lastName}</p>
            <div className="flex items-center gap-[10px]">
              <p className="text-sm">
                {individual.status ? "აქტიური" : "დაბლოკილი"}
              </p>
              <Button
                onClick={() => {
                  router.push(`/admin/panel/individuals/${individual.id}`);
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
