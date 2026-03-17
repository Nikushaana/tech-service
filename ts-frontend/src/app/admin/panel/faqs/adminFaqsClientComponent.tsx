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

const fetchAdminFaqs = async (page: number) => {
  const { data } = await api.get(`admin/faqs?page=${page}`);
  return data;
};

export default function AdminFaqsClientComponent() {
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
    mutationFn: (id: number) => api.delete(`admin/faqs/${id}`),

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
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between">
        <h2 className="text-xl mb-2">FAQs</h2>
        <Link href={"/admin/panel/faqs/add"} className="w-auto self-end">
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
              <TableHead>რიგი</TableHead>
              <TableHead>კითხვა</TableHead>
              <TableHead>პასუხი</TableHead>
              <TableHead>სტატუსი</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!faqs ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია იძებნება...
                </TableCell>
              </TableRow>
            ) : faqs?.total === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია არ მოიძებნა
                </TableCell>
              </TableRow>
            ) : (
              faqs?.data?.map((faq: Faq) => (
                <TableRow key={faq.id} className="hover:bg-gray-100">
                  <TableCell>{faq.id}</TableCell>
                  <TableCell>{faq.order}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {faq.question}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {faq.answer}
                  </TableCell>
                  <TableCell>{faq.status ? "აქტიური" : "დაბლოკილი"}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/panel/faqs/${faq.id}`}>
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
                        handleDeleteFaq(faq.id);
                      }}
                      variant="secondary"
                      size="icon"
                      disabled={
                        deleteFaqMutation.isPending &&
                        deleteFaqMutation.variables === faq.id
                      }
                      className="bg-[red] hover:bg-[#b91c1c] ml-3 text-white cursor-pointer rounded-lg"
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
  );
}
