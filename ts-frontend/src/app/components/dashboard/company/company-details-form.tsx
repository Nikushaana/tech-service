"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import UserDetailsForm from "../shared components/user-details-form";
import { Loader2Icon } from "lucide-react";
import ImageSelector from "../../inputs/image-selector";
import { Button } from "@/components/ui/button";
import { api } from "@/app/lib/api/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

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
  const { data: currentUser } = useCurrentUser();

  const queryClient = useQueryClient();

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
      "კომპანიის საიდენტიფიკაციო კოდი აუცილებელია",
    ),
    companyAgentName: Yup.string().required(
      "კომპანიის წარმომადგენლის სახელი აუცილებელია",
    ),
    companyAgentLastName: Yup.string().required(
      "კომპანიის წარმომადგენლის გვარი აუცილებელია",
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
        values.companyIdentificationCode,
      );

      api
        .patch(`company`, formData)
        .then((res) => {
          toast.success(`ინფორმაცია განახლდა`);
          queryClient.invalidateQueries({
            queryKey: ["currentUser"],
          });
          setValues((prev) => ({
            ...prev,
            newImages: [],
          }));
        })
        .catch((error) => {
          toast.error("ინფორმაცია ვერ განახლდა");
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
            toast.error(e.message);
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
      <div className="self-center">
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
      </div>

      <UserDetailsForm
        title="იურიდიული პირის ინფორმაცია"
        values={values}
        errors={errors}
        fields={companyFields}
        onChange={(field, value) =>
          handleChange({
            target: { id: field, value },
          } as React.ChangeEvent<HTMLInputElement>)
        }
      />

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
