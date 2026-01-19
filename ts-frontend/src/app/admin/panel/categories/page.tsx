"use client";

import { axiosAdmin } from "@/app/lib/api/axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { AiOutlineDelete } from "react-icons/ai";
import { BsEye } from "react-icons/bs";
import { toast } from "react-toastify";

const fetchAdminCategories = async () => {
  const { data } = await axiosAdmin.get("admin/categories");
  return data;
};

export default function Page() {
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: fetchAdminCategories,
    staleTime: 1000 * 60 * 10,
  });

  // delete category
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => axiosAdmin.delete(`admin/categories/${id}`),

    onSuccess: () => {
      toast.success("კატეგორია წაიშალა", {
        position: "bottom-right",
        autoClose: 3000,
      });

      queryClient.invalidateQueries({
        queryKey: ["adminCategories"],
      });
    },

    onError: () => {
      toast.error("ვერ წაიშალა", {
        position: "bottom-right",
        autoClose: 3000,
      });
    },
  });

  const handleDeleteCategory = (id: number) => {
    deleteCategoryMutation.mutate(id);
  };

  if (isLoading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-y-2 w-full">
      <Link href={"/admin/panel/categories/add"} className="w-auto self-end">
        <Button className="h-[45px] w-full px-6 text-white cursor-pointer">დამატება</Button>
      </Link>
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
                categories.map((category: Category) => (
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
                        disabled={
                          deleteCategoryMutation.isPending &&
                          deleteCategoryMutation.variables === category.id
                        }
                        variant="secondary"
                        size="icon"
                        className="bg-[red] hover:bg-[#b91c1c] ml-3 cursor-pointer"
                      >
                        {deleteCategoryMutation.isPending &&
                        deleteCategoryMutation.variables === category.id ? (
                          <Loader2Icon className="animate-spin size-4" />
                        ) : (
                          <AiOutlineDelete className="size-4" />
                        )}
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
