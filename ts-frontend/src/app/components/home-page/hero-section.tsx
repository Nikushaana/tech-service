"use client";

import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="relative flex justify-center w-full">
      <img
        src="/images/1.webp"
        alt="logo"
        className="h-full w-full object-cover max-sm:[object-position:37%_center] absolute inset-0 blur-[2px] brightness-40"
      />

      <div className="z-[2] max-w-[1140px] w-full flex flex-col gap-y-[40px] sm:gap-y-[60px] px-4 pt-[150px] sm:pt-[200px] pb-[100px] sm:pb-[150px]">
        <h1 className="text-white text-center text-[30px] sm:text-[50px]">
          ტექნიკის შეკეთება ასე მარტივი არასდროს ყოფილა
        </h1>
        <hr className="border-gray-300 border-[1px]" />
        <div className="flex flex-col gap-y-[15px] sm:gap-y-[20px]">
          <h2 className="text-white text-[22px] sm:text-[30px] mt-[10px]">
            შეაკეთე ტექნიკა სახლიდან გაუსვლელად
          </h2>
          <p className="text-white text-[15px] sm:text-[17px]">
            შენი კომფორტი ჩვენი პრიორიტეტია – გვაცნობე პრობლემა, ჩვენი გუნდის
            წევრები კი იზრუნებენ მის შეკეთებაზე.
          </p>
          <p className="text-white text-[15px] sm:text-[17px]">
            სანდო, სწრაფი და გამჭვირვალე მომსახურება – სწორედ ისეთი, როგორიც
            გჭირდება.
          </p>
        </div>
        <Button
          onClick={() => {
            router.push("/auth/login");
          }}
          className="md:hidden flex h-[45px] px-[20px] sm:px-[30px] self-center cursor-pointer"
        >
          მოითხოვე სერვისი
        </Button>
      </div>
    </div>
  );
}
