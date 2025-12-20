"use client";

import { axiosAdmin } from "@/app/api/axios";
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

const fetchAdminBranches = async () => {
  const { data } = await axiosAdmin.get("admin/branches");
  return data;
};

export default function Page() {
  const queryClient = useQueryClient();

  const { data: branches, isLoading } = useQuery({
    queryKey: ["adminBranches"],
    queryFn: fetchAdminBranches,
    staleTime: 1000 * 60 * 10,
  });

  // delete branch
  const deleteBranchMutation = useMutation({
    mutationFn: (id: number) => axiosAdmin.delete(`admin/branches/${id}`),

    onSuccess: () => {
      toast.success("ფილიალი წაიშალა", {
        position: "bottom-right",
        autoClose: 3000,
      });

      queryClient.invalidateQueries({
        queryKey: ["adminBranches"],
      });
    },

    onError: () => {
      toast.error("ვერ წაიშალა", {
        position: "bottom-right",
        autoClose: 3000,
      });
    },
  });

  const handleDeleteBranch = (id: number) => {
    deleteBranchMutation.mutate(id);
  };

  if (isLoading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-y-2 w-full">
      <Link href={"/admin/panel/branches/add"} className="w-auto self-end">
        <Button className="h-[45px] w-full px-6 text-white">დამატება</Button>
      </Link>
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">ფილიალები</h2>
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
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((branch: Branch) => (
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
