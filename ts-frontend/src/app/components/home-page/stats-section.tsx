"use client";

import React from "react";
import CountUp from "react-countup";

export default function StatsSection() {
  return (
    <div className="w-full bg-myLightBlue flex justify-center">
      <div className="max-w-[1140px] w-full grid grid-cols-2 sm:grid-cols-4 gap-[20px] sm:gap-[40px] py-[40px] sm:py-[50px] px-4">
        {[
          { id: 1, num: "2000 +", text: "მომხმარებელი" },
          { id: 2, num: "3", text: "წლიანი გამოცდილება" },
          { id: 3, num: "5000 +", text: "შეკეთებული ტექნიკა" },
          { id: 4, num: "10", text: "პროფესიონალი ტექნიკოსი" },
        ].map((item) => (
          <div key={item.id} className="text-white text-center">
            <h2 className="text-[28px] sm:text-[35px]">
              <CountUp end={+item.num.split(" ")[0]} duration={7} />
              {item.num.split(" ")[1]}
            </h2>
            <p className="text-[16px] sm:text-[18px]">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
