"use client";

import { Button } from "@/components/ui/button";
import { useOrdersStore } from "@/app/store/useOrdersStore";

export default function HeroSection() {
  const { toggleOpenCreateOrderModal } = useOrdersStore();

  return (
    <div className="relative flex justify-center w-full h-[55vh] sm:h-[60vh] lg:h-[75vh] rounded-[30px] shadow-lg overflow-hidden">
      <img
        src="/images/1.webp"
        alt="logo"
        className="h-full w-full object-cover max-sm:[object-position:37%_center] absolute inset-0 blur-[1px] brightness-70"
      />

      <div className="z-[2] max-w-[700px] w-full px-4 flex flex-col gap-6 sm:gap-8 items-center justify-center">
        <h1 className="text-white text-center text-[30px] sm:text-[44px] lg:text-[56px]">
          ჩვენ ვიზრუნებთ თქვენს ტექნიკაზე
        </h1>
        <p className="text-white text-center text-[15px] sm:text-[18px] lg:text-[20px]">
          შეავსეთ განაცხადი ტექნიკის შეკეთების ან მონტაჟისთვის და ისარგებლეთ
          საუკეთესო სერვისით
        </p>
        <Button
           onClick={() => {
                toggleOpenCreateOrderModal();
            }}
          className="flex h-[45px] cursor-pointer"
        >
          შეავსე განაცხადი
        </Button>
      </div>
    </div>
  );
}
