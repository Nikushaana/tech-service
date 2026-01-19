"use client";

import StarRating from "@/app/components/inputs/star-rating";
import { Button } from "@/components/ui/button";
import { useReviewsStore } from "@/app/store/useReviewsStore";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { axiosCompany, axiosIndividual } from "@/app/lib/api/axios";

const fetchUserReviews = async (userType: string) => {
  const api = userType === "company" ? axiosCompany : axiosIndividual;
  const { data } = await api.get(`${userType}/reviews`);
  return data;
};

export default function Page() {
  const { userType } = useParams<{
    userType: "company" | "individual";
  }>();

  const { toggleOpenCreateReviewModal } = useReviewsStore();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["userReviews", userType],
    queryFn: () => fetchUserReviews(userType),
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

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
      {reviews.length > 0 && (
        <div className="flex flex-col gap-5 w-full">
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-transform duration-200 transform hover:-translate-y-1 rounded-xl p-[14px] flex flex-col gap-[10px]"
            >
              <p className="font-semibold">{review.review}</p>
              <div className="flex flex-col sm:flex-row gap-5 items-center justify-between">
                <StarRating value={review.stars || 5} />
                <p className="text-sm">
                  დაემატა: {dayjs(review.created_at).format("DD.MM.YYYY HH:mm")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
