"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { toast } from "react-toastify";
import { axiosDelivery, axiosTechnician } from "@/app/api/axios";
import * as Yup from "yup";
import { Loader2Icon } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import ImageSelector from "../inputs/image-selector";
import PanelFormInput from "../inputs/panel-form-input";
import { Button } from "@/components/ui/button";

interface StaffValues {
  name: string;
  lastName: string;
  images: string[];
  deletedImages: string[];
  newImages: File[];
}

export default function StaffDetailsForm() {
  const router = useRouter();
  const pathname = usePathname();
  const { staffType } = useParams<{ staffType: "technician" | "delivery" }>();
  const { currentUser } = useAuthStore();
  const rehydrate = useAuthStore((state) => state.rehydrate);

  const [values, setValues] = useState<StaffValues>({
    name: "",
    lastName: "",
    images: [],
    deletedImages: [],
    newImages: [],
  });

  useEffect(() => {
    if (currentUser) {
      setValues((prev) => ({
        ...prev,
        name: currentUser.name || "",
        lastName: currentUser.lastName || "",
        images: currentUser.images || [],
      }));
    }
  }, [currentUser]);

  const [errors, setErrors] = useState({
    name: "",
    lastName: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  // staff details update

  const updateStaffSchema = Yup.object().shape({
    name: Yup.string().required("სახელი აუცილებელია"),
    lastName: Yup.string().required("გვარი აუცილებელია"),
    newImages: Yup.array()
      .max(1, "შეგიძლიათ ატვირთოთ მაქსიმუმ 1 სურათი")
      .of(Yup.mixed().required()),
  });

  const api = staffType === "technician" ? axiosTechnician : axiosDelivery;

  const handleUpdateStaff = async () => {
    setLoading(true);
    try {
      // Yup validation
      setErrors((prev) => ({
        ...prev,
        name: "",
        lastName: "",
      }));

      await updateStaffSchema.validate(values, { abortEarly: false });

      const formData = new FormData();

      if (values.deletedImages.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(values.deletedImages));
      }

      // Append new files
      values.newImages.forEach((image) => {
        formData.append("images", image);
      });

      // Append other values
      formData.append("name", values.name);
      formData.append("lastName", values.lastName);

      api
        .patch(`${staffType}`, formData)
        .then((res) => {
          toast.success(`ინფორმაცია განახლდა`, {
            position: "bottom-right",
            autoClose: 3000,
          });
          rehydrate(router, pathname);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center gap-[20px]">
        <PanelFormInput
          id="name"
          value={values.name || ""}
          onChange={handleChange}
          label="სახელი"
          error={errors.name}
        />
        <PanelFormInput
          id="lastName"
          value={values.lastName || ""}
          onChange={handleChange}
          label="გვარი"
          error={errors.lastName}
        />
      </div>

      <p
        className={`${
          currentUser?.status ? "bg-green-700" : "bg-red-700"
        } text-white self-start px-6 h-[40px] flex items-center rounded-[10px]`}
      >
        სტატუსი: {currentUser?.status ? "აქტიური" : "დაბლოკილი"}
      </p>

      <Button
        onClick={handleUpdateStaff}
        disabled={loading}
        className="h-11 cursor-pointer self-end"
      >
        {loading && <Loader2Icon className="animate-spin" />}ცვლილების შენახვა
      </Button>
    </div>
  );
}
