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

interface CategoryValues {
  name: string;
  status: boolean;
  images: string[];
  deletedImages: string[];
  newImages: File[];
}

export default function Page() {
  const { categoryId } = useParams<{
    categoryId: string;
  }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [values, setValues] = useState<CategoryValues>({
    name: "",
    status: false,
    images: [],
    deletedImages: [],
    newImages: [],
  });

  const [errors, setErrors] = useState({
    name: "",
  });

  const fetchCategory = () => {
    setLoading(true);
    axiosAdmin
      .get(`admin/categories/${categoryId}`)
      .then((res) => {
        const data = res.data;

        const imagesArray = Array.isArray(data.images) ? data.images : [];

        setValues((prev) => ({
          ...prev,
          status: data.status,
          name: data.name,
          images: imagesArray,
        }));
        setLoading(false);
      })
      .catch(() => {})
      .finally(() => {});
  };

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

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
  const categorySchema = Yup.object().shape({
    name: Yup.string().required("კატეგორია აუცილებელია"),
  });

  const handleUpdateCategory = async () => {
    setLoading(true);
    try {
      await categorySchema.validate(values, { abortEarly: false });

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
      formData.append("status", String(values.status));

      axiosAdmin
        .patch(`admin/categories/${categoryId}`, formData)
        .then(() => {
          toast.success("კატეგორია განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          fetchCategory();

          setValues((prev) => ({
            ...prev,
            newImages: [],
          }));
          setErrors({ name: "" });
        })
        .catch(() => {
          setLoading(false);
          toast.error("ვერ განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });
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
        id="name"
        value={values.name}
        onChange={handleChange}
        label="კატეგორია"
        error={errors.name}
      />

      <Button
        onClick={handleUpdateCategory}
        disabled={loading}
        className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto self-end"
      >
        ცვლილების შენახვა
      </Button>
    </div>
  );
}
