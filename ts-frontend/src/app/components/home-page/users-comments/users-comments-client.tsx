"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import StarRating from "../../inputs/star-rating";
import { IoPersonSharp } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import dayjs from "dayjs";
import "dayjs/locale/ka";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);
dayjs.locale("ka");

export default function UsersCommentsClient({
  reviews,
}: {
  reviews: Review[];
}) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();

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
            spaceBetween={0}
            slidesPerView={2}
            loop
            autoplay={{ delay: 7000, disableOnInteraction: false }}
            speed={2000}
            breakpoints={{
              768: { spaceBetween: 40 },
            }}
            className="w-[180%] sm:w-full"
          >
            {reviews.map((item) => (
              <SwiperSlide key={item.id} className="p-5">
                <div className="shadow-myShadow rounded-[30px] bg-white p-[15px] sm:p-[20px] flex flex-col gap-y-[10px]">
                  <div className="flex items-center justify-between">
                    <StarRating value={item.stars || 5} />
                    <p className="text-gray-500 text-[15px]">
                      {dayjs(item.created_at).format("D MMM, YYYY")}
                    </p>
                  </div>
                  <p className="line-clamp-8">{item.review}</p>
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
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <IoPersonSharp />
                      )}
                    </div>
                    <h1 className="text-[14px] sm:text-[16px]">
                      {item.company?.role == "company"
                        ? item.company?.companyName
                        : item.individual?.name +
                          " " +
                          item.individual?.lastName}
                    </h1>
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
              toast.warning("შესაფასებლად გაიარე ავტორიზაცია");
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
