"use client";

import { Button } from "@/components/ui/button";
import { axiosAdmin } from "@/app/api/axios";
import { toast } from "react-toastify";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { useState } from "react";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Page() {
  const queryClient = useQueryClient();

  const [values, setValues] = useState({
    name: "",
  });
  const [errors, setErrors] = useState({
    name: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  //validation
  const categorySchema = Yup.object().shape({
    name: Yup.string().required("კატეგორია აუცილებელია"),
  });

  //add category
  const addCategoryMutation = useMutation({
    mutationFn: (payload: { name: string }) =>
      axiosAdmin.post("admin/category", payload),

    onSuccess: () => {
      toast.success("კატეგორია დაემატა", {
        position: "bottom-right",
        autoClose: 3000,
      });

      setValues({ name: "" });
      setErrors({ name: "" });

      // refresh categories list
      queryClient.invalidateQueries({
        queryKey: ["adminCategories"],
      });
    },

    onError: () => {
      toast.error("ვერ დაემატა", {
        position: "bottom-right",
        autoClose: 3000,
      });
    },
  });

  const handleAddCategory = async () => {
    try {
      await categorySchema.validate(values, { abortEarly: false });

      addCategoryMutation.mutate(values);
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
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 flex flex-col gap-2 w-full max-w-2xl mx-auto">
      <PanelFormInput
        id="name"
        value={values.name}
        onChange={handleChange}
        label="კატეგორია"
        error={errors.name}
      />

      <div className="flex justify-end">
        <Button
          onClick={handleAddCategory}
          disabled={addCategoryMutation.isPending}
          className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto"
        >
          დამატება
        </Button>
      </div>
    </div>
  );
}
