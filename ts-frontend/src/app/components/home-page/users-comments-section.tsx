"use client";

import React, { useState } from "react";
import { BsStarFill } from "react-icons/bs";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

export default function UsersCommentsSection() {
  const [comments, setComments] = useState([
    {
      id: 1,
      comment:
        "ასეთი სერვისი ჯერ არ მენახა — სახლიდან არ გავსულვარ, ყველაფერი შესანიშნავად მოხდა, შეაკეთეს და უკან მომიტანეს. ძალიან მადლობელი ვარ!",
      user: "ლიკა",
    },
    {
      id: 2,
      comment:
        "სწრაფი და კომფორტული სერვისი! ჩემი ჭურჭლის სარეცხი რამდენიმე დღეში უკვე უკეთეს მდგომარეობაში იყო. დელივერიმ მომიტანა ისევ სახლში, ხელოსანმა ძალიან პროფესიონალურად შეასრულა საქმე. მართლა კარგია! სწრაფი და კომფორტული სერვისი! ჩემი ჭურჭლის სარეცხი რამდენიმე დღეში უკვე უკეთეს მდგომარეობაში იყო. დელივერიმ მომიტანა ისევ სახლში, ხელოსანმა ძალიან პროფესიონალურად შეასრულა საქმე. მართლა კარგია!",
      user: "შავლეგ",
    },
    {
      id: 3,
      comment:
        "ასეთი სერვისი ჯერ არ მენახა — სახლიდან არ გავსულვარ, ყველაფერი შესანიშნავად მოხდა, შეაკეთეს და უკან მომიტანეს. ძალიან მადლობელი ვარ!",
      user: "ლიკა",
    },
    {
      id: 4,
      comment:
        "სწრაფი და კომფორტული სერვისი! ჩემი ჭურჭლის სარეცხი რამდენიმე დღეში უკვე უკეთეს მდგომარეობაში იყო. დელივერიმ მომიტანა ისევ სახლში, ხელოსანმა ძალიან პროფესიონალურად შეასრულა საქმე. მართლა კარგია! სწრაფი და კომფორტული სერვისი! ჩემი ჭურჭლის სარეცხი რამდენიმე დღეში უკვე უკეთეს მდგომარეობაში იყო. დელივერიმ მომიტანა ისევ სახლში, ხელოსანმა ძალიან პროფესიონალურად შეასრულა საქმე. მართლა კარგია!",
      user: "შავლეგ",
    },
    {
      id: 5,
      comment:
        "ასეთი სერვისი ჯერ არ მენახა — სახლიდან არ გავსულვარ, ყველაფერი შესანიშნავად მოხდა, შეაკეთეს და უკან მომიტანეს. ძალიან მადლობელი ვარ!",
      user: "ლიკა",
    },
    {
      id: 6,
      comment:
        "სწრაფი და კომფორტული სერვისი! ჩემი ჭურჭლის სარეცხი რამდენიმე დღეში უკვე უკეთეს მდგომარეობაში იყო. დელივერიმ მომიტანა ისევ სახლში, ხელოსანმა ძალიან პროფესიონალურად შეასრულა საქმე. მართლა კარგია! სწრაფი და კომფორტული სერვისი! ჩემი ჭურჭლის სარეცხი რამდენიმე დღეში უკვე უკეთეს მდგომარეობაში იყო. დელივერიმ მომიტანა ისევ სახლში, ხელოსანმა ძალიან პროფესიონალურად შეასრულა საქმე. მართლა კარგია!",
      user: "შავლეგ",
    },
  ]);
  return (
    <div className="flex flex-col gap-y-[40px] w-full">
      <h2 className="text-center text-[28px] sm:text-[35px]">
        რას ამბობენ ჩვენი მომხმარებლები
      </h2>
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
          {comments.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="rounded-[10px] border-[2px] border-gray-200 p-[15px] sm:p-[20px] flex flex-col justify-between gap-y-[10px]">
                <p className="h-[190px] sm:h-[140px] overflow-hidden">
                  {item.comment}
                </p>
                <div className="flex flex-wrap gap-[10px] items-center justify-between mt-4">
                  <div className="flex items-center gap-[10px]">
                    <img
                      src="/images/logo.png"
                      alt={item.user}
                      className="w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] rounded-full"
                    />
                    <h2 className="text-[14px] sm:text-[16px]">{item.user}</h2>
                  </div>
                  <div className="flex gap-[5px] w-full sm:w-auto justify-end">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <BsStarFill
                        key={star}
                        className="text-amber-300 text-[12px] sm:text-[16px]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
