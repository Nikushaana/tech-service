"use client";

import { axiosAdmin } from "@/app/api/axios";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { toast } from "react-toastify";
import * as Yup from "yup";
import ImageSelector from "@/app/components/inputs/image-selector";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface CompanyValues {
  companyName: string;
  companyAgentName: string;
  companyAgentLastName: string;
  companyIdentificationCode: string;
  phone: string;
  password: string;
  status: boolean;
  images: string[];
  deletedImages: string[];
  newImages: File[];
}

export default function Page() {
  const { companyId } = useParams<{
    companyId: string;
  }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [values, setValues] = useState<CompanyValues>({
    companyName: "",
    companyAgentName: "",
    companyAgentLastName: "",
    companyIdentificationCode: "",
    phone: "",
    password: "",
    status: false,
    images: [],
    deletedImages: [],
    newImages: [],
  });
  const [errors, setErrors] = useState({
    companyName: "",
    companyAgentName: "",
    companyAgentLastName: "",
    companyIdentificationCode: "",
    phone: "",
    password: "",
  });

  const fetchCompany = () => {
    setLoading(true);
    axiosAdmin
      .get(`admin/companies/${companyId}`)
      .then((res) => {
        const data = res.data;

        const imagesArray = Array.isArray(data.images) ? data.images : [];

        setValues((prev) => ({
          ...prev,
          companyName: data.companyName,
          companyAgentName: data.companyAgentName,
          companyAgentLastName: data.companyAgentLastName,
          companyIdentificationCode: data.companyIdentificationCode,
          phone: data.phone,
          password: "",
          status: data.status,
          images: imagesArray,
        }));
        setLoading(false);
      })
      .catch(() => {})
      .finally(() => {});
  };

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // validation
  const companySchema = Yup.object().shape({
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
    phone: Yup.string()
      .matches(/^5\d{8}$/, "ნომერი უნდა დაიწყოს 5-ით და იყოს 9 ციფრი")
      .required("ტელეფონის ნომერი აუცილებელია"),
    password: Yup.string()
      .notRequired()
      .test("len", "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს", (val) => {
        if (!val) return true; // allow empty
        return val.length >= 6;
      }),
  });

  const handleUpdateCompany = async () => {
    setLoading(true);
    try {
      await companySchema.validate(values, { abortEarly: false });

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
      formData.append("phone", values.phone);
      if (values.password) {
        formData.append("password", values.password);
      }
      formData.append("status", String(values.status));

      axiosAdmin
        .patch(`admin/companies/${companyId}`, formData)
        .then(() => {
          toast.success("კომპანია განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          fetchCompany();

          setValues((prev) => ({
            ...prev,
            newImages: [],
          }));
          setErrors({
            companyName: "",
            companyAgentName: "",
            companyAgentLastName: "",
            companyIdentificationCode: "",
            phone: "",
            password: "",
          });
        })
        .catch(() => {
          toast.error("ვერ განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });
          setLoading(false);
        });
    } catch (err: any) {
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

  if (loading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className={`w-full flex flex-col items-center gap-y-[20px]`}>
      <div className="flex items-center gap-2 text-sm">
        <p>დაბლოკილი</p>
        <Switch
          checked={values.status}
          onCheckedChange={(checked) =>
            setValues((prev) => ({ ...prev, status: checked }))
          }
          className="cursor-pointer"
        />
        <p>აქტიური</p>
      </div>

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

      <PanelFormInput
        id="companyName"
        value={values.companyName}
        onChange={handleChange}
        label="კომპანიის სახელი"
        error={errors.companyName}
      />

      <PanelFormInput
        id="companyIdentificationCode"
        value={values.companyIdentificationCode}
        onChange={handleChange}
        label="კომპანიის საიდენტიფიკაციო კოდი"
        error={errors.companyIdentificationCode}
      />
      <PanelFormInput
        id="companyAgentName"
        value={values.companyAgentName}
        onChange={handleChange}
        label="კომპანიის წარმომადგენლის სახელი"
        error={errors.companyAgentName}
      />

      <PanelFormInput
        id="companyAgentLastName"
        value={values.companyAgentLastName}
        onChange={handleChange}
        label="კომპანიის წარმომადგენლის გვარი"
        error={errors.companyAgentLastName}
      />

      <PanelFormInput
        id="phone"
        value={values.phone}
        onChange={handleChange}
        label="ტელეფონის ნომერი"
        error={errors.phone}
      />
      <PanelFormInput
        id="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        label="პაროლი"
        error={errors.password}
      />

      <Button
        onClick={handleUpdateCompany}
        disabled={loading}
        className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto self-end"
      >
        ცვლილების შენახვა
      </Button>
    </div>
  );
}
