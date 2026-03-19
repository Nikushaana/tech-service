"use client";

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { useOrdersStore } from "@/app/store/useOrdersStore";

export default function FaqClient({ faqs }: { faqs: Faq[] }) {
  const [activeFaq, setActiveFaq] = useState<number | null>();
  const { toggleOpenCreateOrderModal } = useOrdersStore();

  return (
    <div className="flex flex-col gap-y-[40px] max-w-[1140px] w-full py-[40px] sm:py-[50px]">
      <h2 className="text-[28px] sm:text-[30px] text-center">
        შესაძლებელია დაგაინტერესოს
      </h2>
      <div className="flex flex-col items-center gap-[20px] sm:gap-[30px] w-full">
        {faqs.length > 0 &&
          faqs?.map((item) => (
            <div
              key={item.id}
              className="rounded-[20px] flex flex-col overflow-hidden w-full shadow-sm"
            >
              <div
                onClick={() =>
                  setActiveFaq((pre) => (item.id !== pre ? item.id : null))
                }
                className={`p-[15px] sm:p-[20px] flex items-center justify-between cursor-pointer duration-150 ${activeFaq == item.id ? "bg-myLightBlue text-white" : "bg-white"}`}
              >
                <h1 className="text-[14px] sm:text-[16px]">{item.question}</h1>
                <IoIosArrowDown
                  className={`text-[18px] sm:text-[20px] duration-300 shrink-0 ${
                    activeFaq == item.id ? "rotate-[180deg]" : ""
                  }`}
                />
              </div>
              <div
                className={`bg-white duration-150 px-[15px] sm:px-[20px] overflow-y-scroll showScroll ${
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
            toggleOpenCreateOrderModal();
          }}
          className="flex h-[45px] px-[20px] sm:px-[30px] self-center cursor-pointer"
        >
          შეავსე განაცხადი
        </Button>
      </div>
    </div>
  );
}
