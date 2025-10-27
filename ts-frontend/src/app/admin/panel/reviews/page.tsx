"use client";

import { axiosAdmin } from "@/app/api/axios";
import StarRating from "@/app/components/inputs/star-rating";
import { Button } from "@/app/components/ui/button";
import { statusTranslations } from "@/app/utils/status-translations";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BsEye } from "react-icons/bs";
import { IoPersonSharp } from "react-icons/io5";
import { toast } from "react-toastify";

export default function Page() {
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    axiosAdmin
      .get("/admin/reviews")
      .then(({ data }) => setReviews(data))
      .catch((err) => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // delete review
  const handleDeleteReview = async (id: number) => {
    setLoading(true);
    axiosAdmin
      .delete(`/admin/reviews/${id}`)
      .then(() => {
        toast.success("შეფასება წაიშალა", {
          position: "bottom-right",
          autoClose: 3000,
        });
        fetchReviews();
      })
      .catch(() => {
        toast.error("ვერ წაიშალა", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setLoading(false);
      })
      .finally(() => {});
  };

  return (
    <div className="flex flex-col items-center gap-y-[20px] w-full">
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        reviews.map((order) => (
          <div
            key={order.id}
            className="bg-white w-full border border-gray-200 shadow-sm hover:shadow-lg transition-transform duration-200 transform hover:-translate-y-1 rounded-xl p-[14px] flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <p>{order.status ? "გამოქვეყნებულია" : "გამოუქვეყნებელია"}</p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    router.push(`/admin/panel/reviews/${order.id}`);
                  }}
                  className="bg-[gray] hover:bg-[#696767] text-[20px] p-0! w-[40px] h-[40px] cursor-pointer"
                >
                  <BsEye />
                </Button>
                <Button
                  onClick={() => {
                    handleDeleteReview(order.id);
                  }}
                  className="bg-[red] hover:bg-[#b91c1c] text-[20px] h-[40px] cursor-pointer"
                >
                  <AiOutlineDelete />
                </Button>
              </div>
            </div>
            <StarRating value={order.stars || 5} />

            <p className="font-semibold line-clamp-2">{order.review}</p>

            <div className="flex flex-col sm:flex-row gap-5 items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <div className="w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] rounded-full overflow-hidden bg-myLightBlue text-white flex items-center justify-center text-[18px]">
                  {(
                    order.company?.role == "company"
                      ? order.company?.images[0]
                      : order.individual?.images[0]
                  ) ? (
                    <img
                      src={
                        order.company?.role == "company"
                          ? order.company?.images[0]
                          : order.individual?.images[0]
                      }
                      alt={order.review}
                      className="w-full h-full"
                    />
                  ) : (
                    <IoPersonSharp />
                  )}
                </div>

                <h2 className="text-[14px] sm:text-[16px]">
                  {order.company?.role == "company" ? order.company?.companyName : order.individual?.name + " " + order.individual?.lastName}
                </h2>
              </div>
              <p className="text-sm">
                დაემატა:{" "}
                {dayjs(order.created_at).format("DD.MM.YYYY - HH:mm:ss")}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
