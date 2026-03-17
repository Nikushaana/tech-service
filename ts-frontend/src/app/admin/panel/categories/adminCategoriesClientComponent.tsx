"use client";

import LinearLoader from "@/app/components/linearLoader";
import Pagination from "@/app/components/pagination/pagination";
import { api } from "@/app/lib/api/axios";
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
import { useSearchParams } from "next/navigation";
import { AiOutlineDelete } from "react-icons/ai";
import { BsEye } from "react-icons/bs";
import { toast } from "react-toastify";

const fetchAdminCategories = async (page: number) => {
  const { data } = await api.get(`admin/categories?page=${page}`);
  return data;
};

export default function AdminCategoriesClientComponent() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const queryClient = useQueryClient();

  const { data: categories, isFetching } = useQuery({
    queryKey: ["adminCategories", page],
    queryFn: () => fetchAdminCategories(page),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  // delete category
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => api.delete(`admin/categories/${id}`),

    onSuccess: () => {
      toast.success("კატეგორია წაიშალა");

      queryClient.invalidateQueries({
        queryKey: ["adminCategories"],
      });
    },

    onError: () => {
      toast.error("ვერ წაიშალა");
    },
  });

  const handleDeleteCategory = (id: number) => {
    deleteCategoryMutation.mutate(id);
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between">
        <h2 className="text-xl mb-2">კატეგორიები</h2>
        <Link href={"/admin/panel/categories/add"} className="w-auto self-end">
          <Button className="h-[45px] w-full px-6 text-white cursor-pointer">
            დამატება
          </Button>
        </Link>
      </div>

      <LinearLoader isLoading={isFetching} />

      <div className="overflow-x-auto w-full">
        <Table className="min-w-[900px] table-auto">
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableHead>ID</TableHead>
              <TableHead>ფოტო</TableHead>
              <TableHead>კატეგორია</TableHead>
              <TableHead>სტატუსი</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!categories ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია იძებნება...
                </TableCell>
              </TableRow>
            ) : categories?.total === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია არ მოიძებნა
                </TableCell>
              </TableRow>
            ) : (
              categories?.data?.map((category: Category) => (
                <TableRow key={category.id} className="hover:bg-gray-100">
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
                        className="bg-myLightBlue hover:bg-myBlue text-white cursor-pointer rounded-lg"
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
                      className="bg-[red] hover:bg-[#b91c1c] ml-3 text-white cursor-pointer rounded-lg"
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

      <div className="flex justify-end">
        <Pagination totalPages={categories?.totalPages} currentPage={page} />
      </div>
    </div>
  );
}
