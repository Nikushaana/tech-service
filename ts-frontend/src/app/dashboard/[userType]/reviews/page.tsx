"use client";

import StarRating from "@/app/components/inputs/star-rating";
import { Button } from "@/app/components/ui/button";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import { useCategoriesStore } from "@/app/store/useCategoriesStore";
import { useOrdersStore } from "@/app/store/useOrdersStore";
import { useReviewsStore } from "@/app/store/useReviewsStore";
import { statusTranslations } from "@/app/utils/status-translations";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { BiCategory } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import { LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";

interface PageProps {
  params: Promise<{
    userType: "company" | "individual";
  }>;
}

export default function Page({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { userType } = resolvedParams;

  const router = useRouter();

  const { reviews, fetchReviews, toggleOpenCreateReviewModal, loading } =
    useReviewsStore();

  useEffect(() => {
    fetchReviews(userType); // fetch correct type on mount
  }, [userType]);

  return (
    <div
      className={`w-full flex flex-col gap-y-[30px] items-center ${
        (loading || reviews.length == 0) && "justify-center"
      }`}
    >
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <>
          {reviews.length == 0 && (
            <p className="text-2xl font-semibold text-myLightGray text-center">
              შეფასება ჯერ არ გაქვს დამატებული
            </p>
          )}
          <Button
            onClick={() => {
              toggleOpenCreateReviewModal(userType);
            }}
            className={`cursor-pointer ${
              reviews.length > 0 ? "h-[40px]" : "text-lg h-[50px]"
            }`}
          >
            <LuPlus
              className={`${
                reviews.length > 0 ? "text-[18px]" : "text-[22px]"
              }`}
            />{" "}
            შეფასება
          </Button>

          {reviews.length > 0 && (
            <div className="flex flex-col gap-5 w-full">
              {reviews.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-transform duration-200 transform hover:-translate-y-1 rounded-xl p-[14px] flex flex-col gap-[10px]"
                >
                  <p className="font-semibold">{item.review}</p>
                  <div className="flex flex-col sm:flex-row gap-5 items-center justify-between">
                    <StarRating value={item.stars || 5} />
                    <p className="text-sm">
                      დაემატა:{" "}
                      {dayjs(item.created_at).format("DD.MM.YYYY - HH:mm:ss")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
