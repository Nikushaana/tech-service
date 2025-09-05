"use client";

import { useAuthStore } from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import React from "react";
import { BiCategory } from "react-icons/bi";

export default function ServicesClient({
  categories,
}: {
  categories: CategoryData;
}) {
  const router = useRouter();
  const { currentUser } = useAuthStore();

  return (
    <div className="flex flex-col gap-y-[30px] sm:gap-y-[50px]">
      <h2 className="text-center text-[24px] sm:text-[30px]">
        ჩვენ შევაკეთებთ შენს ტექნიკას
      </h2>
      <div className="flex flex-wrap justify-center gap-[20px] sm:gap-[40px]">
        {categories.data.map((item, index) => (
          <div
            key={item.id}
            className="rounded-[10px] border-[2px] border-gray-200 px-[10px] sm:px-[20px] py-[10px] flex flex-col items-center gap-y-[15px] sm:gap-y-[20px] cursor-default hover:hover:scale-110 duration-200 w-[calc((100%-20px)/2)] sm:w-[calc((100%-80px)/3)] lg:w-[calc((100%-160px)/5)]"
          >
            <img
              // src={item.images && item.images[0]}
              src={`${
                index == 0
                  ? "/images/conditioner.png"
                  : index == 1
                  ? "/images/wurwlissarecxi.png"
                  : index == 2
                  ? "/images/tv.png"
                  : index == 3 && "/images/macivari.png"
              }`}
              alt={item.name}
              className="aspect-square sm:aspect-video lg:aspect-square object-contain w-[50px] sm:w-full"
            />
            <p className="text-center text-[14px] sm:text-[16px]">
              {item.name}
            </p>
          </div>
        ))}
        <div
          onClick={() => {
            if (currentUser) {
              if (currentUser?.role === "individual")
                router.push("/dashboard/individual/orders");
              else if (currentUser?.role === "company")
                router.push("/dashboard/company/orders");
            } else {
              router.push("/auth/login");
            }
          }}
          className="rounded-[10px] px-[10px] sm:px-[20px] py-[10px] flex flex-col items-center gap-y-[15px] sm:gap-y-[20px] bg-myLightBlue hover:bg-myBlue duration-200 text-white  cursor-pointer group hover:hover:scale-110 w-[calc((100%-20px)/2)] sm:w-[calc((100%-80px)/3)] lg:w-[calc((100%-160px)/5)]"
        >
          <div className="aspect-square sm:aspect-video lg:aspect-square w-[50px] sm:w-full flex items-center justify-center text-[60px] group-hover:scale-110 group-hover:aspect-video duration-200">
            <BiCategory />
          </div>

          <p className="text-center text-[14px] sm:text-[16px]">
            იპოვე სასურველი კატეგორია
          </p>
        </div>
      </div>
    </div>
  );
}
