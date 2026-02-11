"use client";

import LinearLoader from "@/app/components/linearLoader";
import Pagination from "@/app/components/pagination/pagination";
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
import { useSearchParams } from "next/navigation";
import { AiOutlineDelete } from "react-icons/ai";
import { BsEye } from "react-icons/bs";
import { toast } from "react-toastify";

const fetchAdminBranches = async (page: number) => {
  const { data } = await axiosAdmin.get(`admin/branches?page=${page}`);
  return data;
};

export default function Page() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const queryClient = useQueryClient();

  const { data: branches, isFetching } = useQuery({
    queryKey: ["adminBranches", page],
    queryFn: () => fetchAdminBranches(page),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  // delete branch
  const deleteBranchMutation = useMutation({
    mutationFn: (id: number) => axiosAdmin.delete(`admin/branches/${id}`),

    onSuccess: () => {
      toast.success("ფილიალი წაიშალა");

      queryClient.invalidateQueries({
        queryKey: ["adminBranches"],
      });
    },

    onError: () => {
      toast.error("ვერ წაიშალა");
    },
  });

  const handleDeleteBranch = (id: number) => {
    deleteBranchMutation.mutate(id);
  };

  return (
    <div className="flex flex-col items-center gap-y-2 w-full">
      <Link href={"/admin/panel/branches/add"} className="w-auto self-end">
        <Button className="h-[45px] w-full px-6 text-white cursor-pointer">
          დამატება
        </Button>
      </Link>
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-2">
        <h2 className="text-xl font-semibold mb-2">ფილიალები</h2>

        <div className="flex justify-end">
          <Pagination totalPages={branches?.totalPages} currentPage={page} />
        </div>

        <LinearLoader isLoading={isFetching} />

        <div className="overflow-x-auto w-full">
          <Table className="min-w-[900px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">სახელი</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!branches ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია იძებნება...
                  </TableCell>
                </TableRow>
              ) : branches?.total === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                branches?.data?.map((branch: Branch) => (
                  <TableRow key={branch.id} className="hover:bg-gray-50">
                    <TableCell>{branch.id}</TableCell>
                    <TableCell>{branch.name}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/panel/branches/${branch.id}`}>
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
                          handleDeleteBranch(branch.id);
                        }}
                        variant="secondary"
                        size="icon"
                        disabled={
                          deleteBranchMutation.isPending &&
                          deleteBranchMutation.variables === branch.id
                        }
                        className="bg-[red] hover:bg-[#b91c1c] ml-3 cursor-pointer"
                      >
                        {deleteBranchMutation.isPending &&
                        deleteBranchMutation.variables === branch.id ? (
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
          <Pagination totalPages={branches?.totalPages} currentPage={page} />
        </div>
      </div>
    </div>
  );
}
