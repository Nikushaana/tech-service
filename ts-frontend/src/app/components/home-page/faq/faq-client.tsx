"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { IoIosArrowDown } from "react-icons/io";

export default function FaqClient({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>();

  return (
    <div className="flex flex-col gap-y-[40px]">
      <h2 className="text-[28px] sm:text-[30px]">შესაძლებელია დაგაინტერესოს</h2>
      <div className="flex flex-col items-center gap-[20px] sm:gap-[30px] w-full">
        {faqs.map((item) => (
          <div
            key={item.id}
            className="rounded-[10px] border-[2px] border-gray-200 flex flex-col overflow-hidden w-full"
          >
            <div
              onClick={() =>
                setActiveFaq((pre) => (item.id !== pre ? item.id : null))
              }
              className="bg-myLightBlue hover:bg-myBlue duration-200 text-white p-[15px] sm:p-[20px] flex items-center justify-between cursor-pointer"
            >
              <h1 className="text-[14px] sm:text-[16px]">{item.question}</h1>
              <IoIosArrowDown
                className={`text-[18px] sm:text-[20px] duration-300 ${
                  activeFaq == item.id ? "rotate-[180deg]" : ""
                }`}
              />
            </div>
            <div
              className={`bg-gray-100 duration-300 px-[15px] sm:px-[20px] overflow-y-scroll showScroll ${
                activeFaq == item.id
                  ? "py-[15px] sm:py-[20px] h-[150px]"
                  : "opacity-0 h-0 py-0"
              }`}
            >
              <p className="text-[14px] sm:text-[16px]">{item.answer}</p>
            </div>
          </div>
        ))}

        <Button
          onClick={() => {
            router.push("/auth/login");
          }}
          className="flex h-[45px] px-[20px] sm:px-[30px] self-center cursor-pointer"
        >
          მოითხოვე სერვისი
        </Button>
      </div>
    </div>
  );
}
