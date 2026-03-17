"use client";

import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import Link from "next/link";
import { BiCategory } from "react-icons/bi";

export default function ServicesClient({
  categories,
}: {
  categories: CategoryData;
}) {
  const { data: currentUser } = useCurrentUser();

  const path = currentUser
    ? currentUser.role === "individual"
      ? "/dashboard/individual/orders"
      : "/dashboard/company/orders"
    : "/auth/login";

  return (
    <div className="flex flex-col gap-y-[30px] sm:gap-y-[50px]">
      <h2 className="text-center text-[24px] sm:text-[30px]">
        ჩვენ შევაკეთებთ შენს ტექნიკას
      </h2>
      <div className="flex flex-wrap justify-center gap-[20px] sm:gap-[40px]">
        {categories.data?.map((item, index) => (
          <div
            key={item.id}
            className="rounded-[30px] shadow-md bg-gray-100 p-[20px] flex flex-col items-center gap-y-[15px] sm:gap-y-[20px] cursor-default hover:hover:scale-110 duration-200 w-[calc((100%-20px)/2)] sm:w-[calc((100%-80px)/3)] lg:w-[calc((100%-160px)/5)]"
          >
            <img
              src={(item.images && item.images[0]) || "/images/logo.png"}
              alt={item.name}
              className="aspect-square sm:aspect-video lg:aspect-square object-contain w-[50px] sm:w-full"
            />
            <h1 className="text-center text-[14px] sm:text-[16px]">
              {item.name}
            </h1>
          </div>
        ))}
        <Link
          href={path}
          className="rounded-[30px] px-[10px] sm:px-[20px] py-[10px] flex flex-col items-center gap-y-[15px] sm:gap-y-[20px] bg-myLightBlue hover:bg-myBlue duration-200 text-white  cursor-pointer hover:hover:scale-110 w-[calc((100%-20px)/2)] sm:w-[calc((100%-80px)/3)] lg:w-[calc((100%-160px)/5)]"
        >
          <div className="aspect-square sm:aspect-video lg:aspect-square w-[50px] sm:w-full flex items-center justify-center text-[60px]">
            <BiCategory />
          </div>

          <h1 className="text-center text-[14px] sm:text-[16px]">
            იპოვე სასურველი კატეგორია
          </h1>
        </Link>
      </div>
    </div>
  );
}
