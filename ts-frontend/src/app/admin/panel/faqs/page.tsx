"use client";

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

const fetchAdminFaqs = async (page: number) => {
  const { data } = await axiosAdmin.get(`admin/faqs?page=${page}`);
  return data;
};

export default function Page() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const queryClient = useQueryClient();

  const { data: faqs, isFetching } = useQuery({
    queryKey: ["adminFaqs", page],
    queryFn: () => fetchAdminFaqs(page),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  // delete faq
  const deleteFaqMutation = useMutation({
    mutationFn: (id: number) => axiosAdmin.delete(`admin/faqs/${id}`),

    onSuccess: () => {
      toast.success("FAQ წაიშალა");

      queryClient.invalidateQueries({
        queryKey: ["adminFaqs"],
      });
    },

    onError: () => {
      toast.error("ვერ წაიშალა");
    },
  });

  const handleDeleteFaq = (id: number) => {
    deleteFaqMutation.mutate(id);
  };

  return (
    <div className="flex flex-col items-center gap-y-2 w-full">
      <Link href={"/admin/panel/faqs/add"} className="w-auto self-end">
        <Button className="h-[45px] w-full px-6 text-white cursor-pointer">
          დამატება
        </Button>
      </Link>
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-2">
        <h2 className="text-xl font-semibold mb-2">FAQs</h2>

        <div className="flex justify-end">
          <Pagination totalPages={faqs?.totalPages} currentPage={page} />
        </div>

        {isFetching && (
          <div className="flex justify-center w-full mt-10">
            <Loader2Icon className="animate-spin size-6 text-gray-600" />
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <Table className="min-w-[900px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">რიგი</TableHead>
                <TableHead className="font-semibold">კითხვა</TableHead>
                <TableHead className="font-semibold">პასუხი</TableHead>
                <TableHead className="font-semibold">სტატუსი</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs?.total === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                faqs?.data?.map((faq: Faq) => (
                  <TableRow key={faq.id} className="hover:bg-gray-50">
                    <TableCell>{faq.id}</TableCell>
                    <TableCell>{faq.order}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {faq.question}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {faq.answer}
                    </TableCell>
                    <TableCell>
                      {faq.status ? "აქტიური" : "დაბლოკილი"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/panel/faqs/${faq.id}`}>
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
                          handleDeleteFaq(faq.id);
                        }}
                        variant="secondary"
                        size="icon"
                        disabled={
                          deleteFaqMutation.isPending &&
                          deleteFaqMutation.variables === faq.id
                        }
                        className="bg-[red] hover:bg-[#b91c1c] ml-3 cursor-pointer"
                      >
                        {deleteFaqMutation.isPending &&
                        deleteFaqMutation.variables === faq.id ? (
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
          <Pagination totalPages={faqs?.totalPages} currentPage={page} />
        </div>
      </div>
    </div>
  );
}
