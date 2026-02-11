"use client";

import StarRating from "@/app/components/inputs/star-rating";
import { Button } from "@/components/ui/button";
import { useReviewsStore } from "@/app/store/useReviewsStore";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { axiosCompany, axiosIndividual } from "@/app/lib/api/axios";
import Pagination from "@/app/components/pagination/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LinearLoader from "@/app/components/linearLoader";

const fetchUserReviews = async (page: number, userType: ClientRole) => {
  const api = userType === "company" ? axiosCompany : axiosIndividual;
  const { data } = await api.get(`${userType}/reviews?page=${page}`);
  return data;
};

export default function Page() {
  const { userType } = useParams<{
    userType: ClientRole;
  }>();

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { toggleOpenCreateReviewModal } = useReviewsStore();

  const { data: reviews, isFetching } = useQuery({
    queryKey: ["userReviews", userType, page],
    queryFn: () => fetchUserReviews(page, userType),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  return (
    <div className={`w-full flex flex-col gap-y-2`}>
      <div className="self-end">
        <Button
          onClick={() => {
            toggleOpenCreateReviewModal(userType);
          }}
          className={`cursor-pointer h-[40px]`}
        >
          დატოვე შეფასება
        </Button>
      </div>
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-2">
        <h2 className="text-xl font-semibold mb-2">შეაფასე Tech Service</h2>
        <div className="flex justify-end">
          <Pagination totalPages={reviews?.totalPages} currentPage={page} />
        </div>

        <LinearLoader isLoading={isFetching} />

        <div className="overflow-x-auto w-full">
          <Table className="min-w-[900px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">ვარსკვლავი</TableHead>
                <TableHead className="font-semibold">შეფასება</TableHead>
                <TableHead className="text-right font-semibold">
                  განაცხადის თარიღი
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!reviews ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია იძებნება...
                  </TableCell>
                </TableRow>
              ) : reviews?.total === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
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
                      <StarRating value={review.stars || 5} />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {review.review}
                    </TableCell>
                    <TableCell className="text-right">
                      {dayjs(review.created_at).format("DD.MM.YYYY HH:mm")}
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
    </div>
  );
}
