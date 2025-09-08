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

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = () => {
    setLoading(true);
    axiosAdmin
      .get("/admin/categories")
      .then(({ data }) => setCategories(data))
      .catch((err) => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  // validation
  const categorySchema = Yup.object().shape({
    name: Yup.string().required("კატეგორია აუცილებელია"),
  });

  // add category
  const handleAddCategory = async () => {
    setLoading(true);
    try {
      await categorySchema.validate(values, { abortEarly: false });

      axiosAdmin
        .post(`/admin/category`, values)
        .then(() => {
          toast.success("კატეგორია დაემატა", {
            position: "bottom-right",
            autoClose: 3000,
          });
          fetchCategories();
          setValues({ name: "" });
          setErrors({ name: "" });
        })
        .catch(() => {
          toast.error("ვერ დაემატა", {
            position: "bottom-right",
            autoClose: 3000,
          });
          setLoading(false);
        })
        .finally(() => {});
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

  // delete category
  const handleDeleteCategory = async (id: number) => {
    setLoading(true);
    axiosAdmin
      .delete(`/admin/categories/${id}`)
      .then(() => {
        toast.success("კატეგორია წაიშალა", {
          position: "bottom-right",
          autoClose: 3000,
        });
        fetchCategories();
      })
      .catch(() => {
        toast.error("ვერ წაიშალა", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setLoading(false);
      })
      .finally(() => {});
  };

  return (
    <div className="flex flex-col items-center gap-y-[20px] w-full">
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col gap-2 w-full max-w-2xl mx-auto">
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
            disabled={loading}
            className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto"
          >
            {loading && <Loader2Icon className="animate-spin mr-2" />}
            დამატება
          </Button>
        </div>
      </div>
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        categories.map((category) => (
          <div
            key={category.id}
            className="w-full p-4 border rounded-xl shadow-sm bg-white flex flex-col sm:flex-row gap-[10px] items-center justify-between"
          >
            <h2 className="text-lg">{category.name}</h2>
            <div className="flex items-center gap-[10px]">
              <p className="text-sm">
                {category.status ? "აქტიური" : "დაბლოკილი"}
              </p>
              <Button
                onClick={() => {
                  router.push(`/admin/panel/categories/${category.id}`);
                }}
                className="bg-[gray] hover:bg-[#696767] text-[20px] cursor-pointer"
              >
                <BsPen />
              </Button>
              <Button
                onClick={() => {
                  handleDeleteCategory(category.id);
                }}
                className="bg-[red] hover:bg-[#b91c1c] text-[20px] cursor-pointer"
              >
                <AiOutlineDelete />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
