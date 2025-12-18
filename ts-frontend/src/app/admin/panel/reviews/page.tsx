"use client";

import { axiosAdmin } from "@/app/api/axios";
import StarRating from "@/app/components/inputs/star-rating";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BsEye } from "react-icons/bs";
import { IoPersonSharp } from "react-icons/io5";
import { toast } from "react-toastify";

const fetchAdminReviews = async () => {
  const { data } = await axiosAdmin.get("admin/reviews");
  return data;
};

export default function Page() {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["adminReviews"],
    queryFn: fetchAdminReviews,
    staleTime: 1000 * 60 * 10,
  });

  // delete review
  const deleteReviewMutation = useMutation({
    mutationFn: (id: number) => axiosAdmin.delete(`admin/reviews/${id}`),

    onSuccess: () => {
      toast.success("შეფასება წაიშალა", {
        position: "bottom-right",
        autoClose: 3000,
      });

      queryClient.invalidateQueries({
        queryKey: ["adminReviews"],
      });
    },

    onError: () => {
      toast.error("ვერ წაიშალა", {
        position: "bottom-right",
        autoClose: 3000,
      });
    },
  });

  const handleDeleteReview = (id: number) => {
    deleteReviewMutation.mutate(id);
  };

  if (isLoading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4">შეფასებები</h2>
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
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია არ მოიძებნა
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review: Review) => (
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
  );
}
