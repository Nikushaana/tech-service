"use client";

import { axiosAdmin } from "@/app/api/axios";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { Switch } from "@/app/components/ui/switch";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Button } from "@/app/components/ui/button";
import ImageSelector from "@/app/components/inputs/image-selector";
import { useParams } from "next/navigation";

interface DeliveryValues {
  name: string;
  lastName: string;
  phone: string;
  password: string;
  status: boolean;
  images: string[];
  deletedImages: string[];
  newImages: File[];
}

export default function Page() {
  const { deliveryId } = useParams<{
    deliveryId: string;
  }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [values, setValues] = useState<DeliveryValues>({
    name: "",
    lastName: "",
    phone: "",
    password: "",
    status: false,
    images: [],
    deletedImages: [],
    newImages: [],
  });
  const [errors, setErrors] = useState({
    name: "",
    lastName: "",
    phone: "",
    password: "",
  });

  const fetchDelivery = () => {
    setLoading(true);
    axiosAdmin
      .get(`admin/deliveries/${deliveryId}`)
      .then((res) => {
        const data = res.data;

        const imagesArray = Array.isArray(data.images) ? data.images : [];

        setValues((prev) => ({
          ...prev,
          name: data.name,
          lastName: data.lastName,
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
    fetchDelivery();
  }, [deliveryId]);

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
  const deliverySchema = Yup.object().shape({
    name: Yup.string().required("სახელი აუცილებელია"),
    lastName: Yup.string().required("გვარი აუცილებელია"),
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

  const handleUpdateDelivery = async () => {
    setLoading(true);
    try {
      await deliverySchema.validate(values, { abortEarly: false });

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
      formData.append("phone", values.phone);
      if (values.password) {
        formData.append("password", values.password);
      }
      formData.append("status", String(values.status));

      axiosAdmin
        .patch(`admin/deliveries/${deliveryId}`, formData)
        .then(() => {
          toast.success("კურიერი განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          fetchDelivery();

          setValues((prev) => ({
            ...prev,
            newImages: [],
          }));
          setErrors({ name: "", lastName: "", phone: "", password: "" });
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
        id="name"
        value={values.name}
        onChange={handleChange}
        label="სახელი"
        error={errors.name}
      />

      <PanelFormInput
        id="lastName"
        value={values.lastName}
        onChange={handleChange}
        label="გვარი"
        error={errors.lastName}
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
        onClick={handleUpdateDelivery}
        disabled={loading}
        className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto self-end"
      >
        ცვლილების შენახვა
      </Button>
    </div>
  );
}
