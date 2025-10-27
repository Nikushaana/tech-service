"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { Button } from "../../ui/button";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import StarRating from "../../inputs/star-rating";
import { IoPersonSharp } from "react-icons/io5";

export default function UsersCommentsClient({
  reviews,
}: {
  reviews: Review[];
}) {
  const router = useRouter();
  const { currentUser } = useAuthStore();

  return (
    <div className="flex flex-col items-center gap-y-[40px] w-full">
      <h2 className="text-center text-[28px] sm:text-[35px]">
        {reviews.length > 0
          ? "რას ამბობენ ჩვენი მომხმარებლები"
          : "იყავით პირველი ვინც შეაფასებს ჩვენს სერვისს!"}
      </h2>
      {reviews.length > 0 ? (
        <div className="overflow-hidden w-full">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            slidesPerView={2}
            loop
            autoplay={{ delay: 7000, disableOnInteraction: false }}
            speed={2000}
            breakpoints={{
              768: { spaceBetween: 40 },
            }}
            className="w-[170%] sm:w-full"
          >
            {reviews.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="rounded-[10px] border-[2px] border-gray-200 bg-white p-[15px] sm:p-[20px] flex flex-col justify-between gap-y-[10px]">
                  <p className="line-clamp-11">{item.review}</p>
                  <div className="flex flex-col md:flex-row gap-[10px] items-center justify-between mt-4">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] rounded-full overflow-hidden bg-myLightBlue text-white flex items-center justify-center text-[18px]">
                        {(
                          item.company?.role == "company"
                            ? item.company?.images[0]
                            : item.individual?.images[0]
                        ) ? (
                          <img
                            src={
                              item.company?.role == "company"
                                ? item.company?.images[0]
                                : item.individual?.images[0]
                            }
                            alt={item.review}
                            className="w-full h-full"
                          />
                        ) : (
                          <IoPersonSharp />
                        )}
                      </div>
                      <h2 className="text-[14px] sm:text-[16px]">
                        {item.company?.role == "company"
                          ? item.company?.companyName
                          : item.individual?.name +
                            " " +
                            item.individual?.lastName}
                      </h2>
                    </div>
                    <StarRating value={item.stars || 5} />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <Button
          onClick={() => {
            if (currentUser) {
              const path =
                currentUser.role === "individual"
                  ? "/dashboard/individual/reviews"
                  : "/dashboard/company/reviews";

              router.push(path);
            } else {
              router.push("/auth/login");
              toast.warning("შესაფასებლად გაიარე ავტორიზაცია", {
                position: "bottom-right",
                autoClose: 3000,
              });
            }
          }}
          className="flex h-[45px] px-[20px] sm:px-[30px] cursor-pointer"
        >
          შეფასება
        </Button>
      )}
    </div>
  );
}
