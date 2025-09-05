"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { useAuthStore } from "@/app/store/useAuthStore";
import { toast } from "react-toastify";
import { axiosCompany } from "@/app/api/axios";
import * as Yup from "yup";
import UserDetailsForm from "../shared components/user-details-form";
import { Loader2Icon } from "lucide-react";

export default function CompanyDetailsForm() {
  const { currentUser } = useAuthStore();

  const [values, setValues] = useState({
    companyName: "",
    companyIdentificationCode: "",
    companyAgentName: "",
    companyAgentLastName: "",
  });

  useEffect(() => {
    if (currentUser) {
      setValues((prev) => ({
        ...prev,
        companyName: currentUser.companyName || "",
        companyIdentificationCode: currentUser.companyIdentificationCode || "",
        companyAgentName: currentUser.companyAgentName || "",
        companyAgentLastName: currentUser.companyAgentLastName || "",
      }));
    }
  }, [currentUser]);

  const [errors, setErrors] = useState({
    companyName: "",
    companyIdentificationCode: "",
    companyAgentName: "",
    companyAgentLastName: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  // company details update

  const updateCompanySchema = Yup.object().shape({
    companyName: Yup.string().required("კომპანიის სახელი აუცილებელია"),
    companyIdentificationCode: Yup.string().required(
      "კომპანიის საიდენტიფიკაციო კოდი აუცილებელია"
    ),
    companyAgentName: Yup.string().required(
      "კომპანიის წარმომადგენლის სახელი აუცილებელია"
    ),
    companyAgentLastName: Yup.string().required(
      "კომპანიის წარმომადგენლის გვარი აუცილებელია"
    ),
  });

  const handleUpdateCompany = async () => {
    setLoading(true);
    try {
      // Yup validation
      setErrors((prev) => ({
        ...prev,
        companyName: "",
        companyIdentificationCode: "",
        companyAgentName: "",
        companyAgentLastName: "",
      }));

      await updateCompanySchema.validate(values, { abortEarly: false });

      axiosCompany
        .patch(`company`, {
          companyName: values.companyName,
          companyIdentificationCode: values.companyIdentificationCode,
          companyAgentName: values.companyAgentName,
          companyAgentLastName: values.companyAgentLastName,
        })
        .then((res) => {
          toast.success(`ინფორმაცია განახლდა`, {
            position: "bottom-right",
            autoClose: 3000,
          });
        })
        .catch((error) => {
          toast.error("ინფორმაცია ვერ განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err: any) {
      // Yup validation errors
      if (err.inner) {
        const newErrors: any = {};
        err.inner.forEach((e: any) => {
          if (e.path) {
            newErrors[e.path] = e.message;
            toast.error(e.message, {
              position: "bottom-right",
              autoClose: 3000,
            });
          }
        });
        setErrors(newErrors);
      }
      setLoading(false);
    }
  };

  const companyFields = [
    { id: "companyName", label: "კომპანიის სახელი" },
    {
      id: "companyIdentificationCode",
      label: "კომპანიის საიდენტიფიკაციო კოდი",
    },
  ];

  const companyAgentFields = [
    { id: "companyAgentName", label: "სახელი" },
    { id: "companyAgentLastName", label: "გვარი" },
  ];

  return (
    <div className="flex flex-col gap-y-[20px]">
      <UserDetailsForm
        title="კომპანიის ინფორმაცია"
        values={values}
        errors={errors}
        fields={companyFields}
        onChange={(field, value) =>
          handleChange({
            target: { id: field, value },
          } as React.ChangeEvent<HTMLInputElement>)
        }
      />

      <p>სტატუსი: {currentUser?.status ? "აქტიური" : "დაბლოკილი"}</p>

      <UserDetailsForm
        title="კომპანიის წარმომადგენლის ინფორმაცია"
        values={values}
        errors={errors}
        fields={companyAgentFields}
        onChange={(field, value) =>
          handleChange({
            target: { id: field, value },
          } as React.ChangeEvent<HTMLInputElement>)
        }
      />
      <Button
        onClick={handleUpdateCompany}
        disabled={loading}
        className="h-11 cursor-pointer self-end"
      >
        {loading && <Loader2Icon className="animate-spin" />}ცვლილების შენახვა
      </Button>
    </div>
  );
}
