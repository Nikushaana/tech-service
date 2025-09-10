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

  const [companies, setCompanies] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = () => {
    setLoading(true);
    axiosAdmin
      .get("/admin/companies")
      .then(({ data }) => setCompanies(data))
      .catch((err) => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="flex flex-col items-center gap-y-[20px] w-full">
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        companies.map((company) => (
          <div
            key={company.id}
            className="w-full p-4 border rounded-xl shadow-sm bg-white flex items-center justify-between"
          >
            <div className="flex items-center gap-[10px]">
              <img
                src={
                  (company.images && company.images[0]) || "/images/logo.png"
                }
                alt={company.name}
                className="aspect-square object-contain w-[40px]"
              />
              <div>
                <h2>{company.companyName}</h2>
                <p className="text-sm">
                  {company.companyAgentName +
                    " " +
                    company.companyAgentLastName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-[10px]">
              <p className="text-sm">
                {company.status ? "აქტიური" : "დაბლოკილი"}
              </p>
              <Button
                onClick={() => {
                  router.push(`/admin/panel/companies/${company.id}`);
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
