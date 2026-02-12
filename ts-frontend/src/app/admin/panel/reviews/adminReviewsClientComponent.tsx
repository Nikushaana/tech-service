"use client";

import StarRating from "@/app/components/inputs/star-rating";
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
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AiOutlineDelete } from "react-icons/ai";
import { BsEye } from "react-icons/bs";
import { IoPersonSharp } from "react-icons/io5";
import { toast } from "react-toastify";

const fetchAdminReviews = async (page: number) => {
  const { data } = await axiosAdmin.get(`admin/reviews?page=${page}`);
  return data;
};

export default function AdminReviewsClientComponent() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const queryClient = useQueryClient();

  const { data: reviews, isFetching } = useQuery({
    queryKey: ["adminReviews", page],
    queryFn: () => fetchAdminReviews(page),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  // delete review
  const deleteReviewMutation = useMutation({
    mutationFn: (id: number) => axiosAdmin.delete(`admin/reviews/${id}`),

    onSuccess: () => {
      toast.success("შეფასება წაიშალა");

      queryClient.invalidateQueries({
        queryKey: ["adminReviews"],
      });
    },

    onError: () => {
      toast.error("ვერ წაიშალა");
    },
  });

  const handleDeleteReview = (id: number) => {
    deleteReviewMutation.mutate(id);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-2">
      <h2 className="text-xl font-semibold mb-2">შეფასებები</h2>

      <div className="flex justify-end">
        <Pagination totalPages={reviews?.totalPages} currentPage={page} />
      </div>

      <LinearLoader isLoading={isFetching} />

      <div className="overflow-x-auto w-full">
        <Table className="min-w-[900px] table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">მომხმარებელი</TableHead>
              <TableHead className="font-semibold">ვარსკვლავი</TableHead>
              <TableHead className="font-semibold">შეფასება</TableHead>
              <TableHead className="font-semibold">სტატუსი</TableHead>
              <TableHead className="font-semibold">განაცხადის თარიღი</TableHead>
              <TableHead className="font-semibold">ცვლილების თარიღი</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!reviews ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია იძებნება...
                  </TableCell>
                </TableRow>
              ) : reviews?.total === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია არ მოიძებნა
                </TableCell>
              </TableRow>
            ) : (
              reviews?.data?.map((review: Review) => (
                <TableRow key={review.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{review.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[35px] h-[35px] rounded-full overflow-hidden bg-myLightBlue text-white flex items-center justify-center">
                        {(
                          review.company?.role == "company"
                            ? review.company?.images[0]
                            : review.individual?.images[0]
                        ) ? (
                          <img
                            src={
                              review.company?.role == "company"
                                ? review.company?.images[0]
                                : review.individual?.images[0]
                            }
                            alt={review.review}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <IoPersonSharp />
                        )}
                      </div>

                      <p>
                        {review.company?.role == "company"
                          ? review.company?.companyName
                          : review.individual?.name +
                            " " +
                            review.individual?.lastName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StarRating value={review.stars || 5} />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {review.review}
                  </TableCell>
                  <TableCell>
                    {review.status ? "გამოქვეყნებულია" : "გამოუქვეყნებელია"}
                  </TableCell>
                  <TableCell>
                    {dayjs(review.created_at).format("DD.MM.YYYY HH:mm")}
                  </TableCell>
                  <TableCell>
                    {dayjs(review.updated_at).format("DD.MM.YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/panel/reviews/${review.id}`}>
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
                        handleDeleteReview(review.id);
                      }}
                      variant="secondary"
                      size="icon"
                      disabled={
                        deleteReviewMutation.isPending &&
                        deleteReviewMutation.variables === review.id
                      }
                      className="bg-[red] hover:bg-[#b91c1c] ml-3 cursor-pointer"
                    >
                      {deleteReviewMutation.isPending &&
                      deleteReviewMutation.variables === review.id ? (
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
        <Pagination totalPages={reviews?.totalPages} currentPage={page} />
      </div>
    </div>
  );
}
