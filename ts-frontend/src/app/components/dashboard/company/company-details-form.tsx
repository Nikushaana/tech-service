"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { useAuthStore } from "@/app/store/useAuthStore";
import { toast } from "react-toastify";
import { axiosCompany } from "@/app/api/axios";
import * as Yup from "yup";
import UserDetailsForm from "../shared components/user-details-form";
import { Loader2Icon } from "lucide-react";
import ImageSelector from "../../inputs/image-selector";
import { useRouter } from "next/navigation";

interface CompanyValues {
  companyName: string;
  companyAgentName: string;
  companyAgentLastName: string;
  companyIdentificationCode: string;
  images: string[];
  deletedImages: string[];
  newImages: File[];
}

export default function CompanyDetailsForm() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const rehydrateClient = useAuthStore((state) => state.rehydrateClient);

  const [values, setValues] = useState<CompanyValues>({
    companyName: "",
    companyIdentificationCode: "",
    companyAgentName: "",
    companyAgentLastName: "",
    images: [],
    deletedImages: [],
    newImages: [],
  });

  useEffect(() => {
    if (currentUser) {
      setValues((prev) => ({
        ...prev,
        companyName: currentUser.companyName || "",
        companyIdentificationCode: currentUser.companyIdentificationCode || "",
        companyAgentName: currentUser.companyAgentName || "",
        companyAgentLastName: currentUser.companyAgentLastName || "",
        images: currentUser.images || [],
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
    newImages: Yup.array()
      .max(1, "შეგიძლიათ ატვირთოთ მაქსიმუმ 1 სურათი")
      .of(Yup.mixed().required()),
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

      const formData = new FormData();

      if (values.deletedImages.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(values.deletedImages));
      }

      // Append new files
      values.newImages.forEach((image) => {
        formData.append("images", image);
      });

      // Append other values
      formData.append("companyName", values.companyName);
      formData.append("companyAgentName", values.companyAgentName);
      formData.append("companyAgentLastName", values.companyAgentLastName);
      formData.append(
        "companyIdentificationCode",
        values.companyIdentificationCode
      );

      axiosCompany
        .patch(`company`, formData)
        .then((res) => {
          toast.success(`ინფორმაცია განახლდა`, {
            position: "bottom-right",
            autoClose: 3000,
          });
          rehydrateClient(router);
          setValues((prev) => ({
            ...prev,
            newImages: [],
          }));
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
      <ImageSelector
        images={values.images}
        setImages={(url: string) =>
          setValues((prev) => ({
            ...prev,
            images: prev.images.filter((img: string) => img !== url),
            deletedImages: [...prev.deletedImages, url],
          }))
        }
        newImages={values.newImages}
        setNewImages={{
          add: (files: File[]) =>
            setValues((prev) => ({
              ...prev,
              newImages: [...prev.newImages, ...files],
            })),
          remove: (file: File) =>
            setValues((prev) => ({
              ...prev,
              newImages: prev.newImages.filter((f) => f !== file),
            })),
        }}
      />
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

      <p
        className={`${
          currentUser?.status ? "bg-green-700" : "bg-red-700"
        } text-white self-start px-6 h-[40px] flex items-center rounded-[10px]`}
      >
        სტატუსი: {currentUser?.status ? "აქტიური" : "დაბლოკილი"}
      </p>

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
