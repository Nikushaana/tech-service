"use client";

import { axiosAdmin } from "@/app/api/axios";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { Switch } from "@/app/components/ui/switch";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Button } from "@/app/components/ui/button";

interface CategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default function Page({ params }: CategoryPageProps) {
  const resolvedParams = React.use(params);
  const { categoryId } = resolvedParams;

  const [loading, setLoading] = useState<boolean>(true);
  const [values, setValues] = useState({
    name: "",
    status: false,
  });
  const [errors, setErrors] = useState({
    name: "",
  });

  useEffect(() => {
    setLoading(true);
    axiosAdmin
      .get(`/admin/categories/${categoryId}`)
      .then((res) => {
        const data = res.data;
        setValues({
          status: data.status,
          name: data.name,
        });
        setLoading(false);
      })
      .catch(() => {})
      .finally(() => {});
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

      axiosAdmin
        .patch(`/admin/categories/${categoryId}`, values)
        .then(() => {
          toast.success("კატეგორია განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          setErrors({ name: "" });
          setLoading(false);
        })
        .catch(() => {
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

  return (
    <div className={`w-full flex flex-col items-center gap-y-[20px]`}>
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <>
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
            {loading && <Loader2Icon className="animate-spin mr-2" />}
            ცვლილების შენახვა
          </Button>
        </>
      )}
    </div>
  );
}
