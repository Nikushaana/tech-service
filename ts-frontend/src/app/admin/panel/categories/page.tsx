"use client";

import { axiosAdmin } from "@/app/api/axios";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BsEye } from "react-icons/bs";
import { toast } from "react-toastify";
import * as Yup from "yup";

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = () => {
    setLoading(true);
    axiosAdmin
      .get("admin/categories")
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
        .post(`admin/category`, values)
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
      .delete(`admin/categories/${id}`)
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

  if (loading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-y-[20px] w-full">
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
            disabled={loading}
            className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto"
          >
            დამატება
          </Button>
        </div>
      </div>
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">კატეგორიები</h2>
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[900px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">ფოტო</TableHead>
                <TableHead className="font-semibold">კატეგორია</TableHead>
                <TableHead className="font-semibold">სტატუსი</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-gray-50">
                    <TableCell>{category.id}</TableCell>
                    <TableCell>
                      <img
                        src={
                          (category.images && category.images[0]) ||
                          "/images/logo.png"
                        }
                        alt={category.name}
                        className="aspect-square object-contain w-[40px]"
                      />
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      {category.status ? "აქტიური" : "დაბლოკილი"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/panel/categories/${category.id}`}>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          <BsEye className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          handleDeleteCategory(category.id);
                        }}
                        variant="secondary"
                        size="icon"
                        className="bg-[red] hover:bg-[#b91c1c] ml-3 cursor-pointer"
                      >
                        <AiOutlineDelete className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
