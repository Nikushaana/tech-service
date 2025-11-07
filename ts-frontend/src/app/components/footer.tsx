"use client";

import React, { useState } from "react";
import {
  BsFacebook,
  BsInstagram,
  BsTelephone,
  BsYoutube,
} from "react-icons/bs";
import { GoMail } from "react-icons/go";
import { useMenuStore } from "../store/useMenuStore";
import { scrollToSection } from "../utils/scroll";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();
  const menu = useMenuStore((state) => state.menu);

  const [other] = useState([
    { id: 1, text: "ჩვენს შესახებ", url: "/about-us" },
    { id: 2, text: "კონფიდენციალურობის პოლიტიკა", url: "" },
    { id: 3, text: "წესები და პირობები", url: "" },
    { id: 4, text: "პასუხისმგებლობის შეზღუდვა", url: "" },
  ]);

  const firstSegment = pathname.split("/")[1];
  const isHidden = firstSegment === "admin" || firstSegment === "staff";

  return (
    <footer className={`w-full ${isHidden ? "hidden" : ""}`}>
      <div className="max-w-[1140px] bg-gray-100 border-[1px] border-gray-300 shadow-inner mx-auto flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-10 md:py-20 gap-10 md:gap-0 rounded-t-[40px]">
        {/* Logo & Social */}
        <div className="flex flex-col gap-6 md:gap-10 w-full md:w-auto">
          <img src="/images/logo.png" alt="logo" className="w-[60px]" />
          <p className="text-myLightGray text-sm md:text-base max-w-[250px]">
            Tech Service — პირველი სრულიად ციფრული სერვისი თქვენი ტექნიკის
            შესაკეთებლად
          </p>
          <div className="flex flex-col gap-y-[10px]">
            <div className="flex items-center gap-2 text-myGray hover:text-myLightBlue duration-100">
              <BsTelephone className="text-2xl" />
              <p className="text-sm md:text-base">+995 5** *** ***</p>
            </div>
            <div className="flex items-center gap-2 text-myGray hover:text-myLightBlue duration-100">
              <GoMail className="text-2xl" />
              <p className="text-sm md:text-base">info@techservice.ge</p>
            </div>
          </div>
          <div className="flex gap-6 text-2xl md:text-3xl">
            <BsFacebook className="text-myGray hover:text-myLightBlue duration-100 cursor-pointer" />
            <BsInstagram className="text-myGray hover:text-myLightBlue duration-100 cursor-pointer" />
            <BsYoutube className="text-myGray hover:text-myLightBlue duration-100 cursor-pointer" />
          </div>
        </div>

        {/* Menus */}
        <div className="flex flex-col sm:flex-row gap-10 md:gap-20 w-full md:w-auto">
          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[20px] md:text-[25px] text-myGray font-semibold">
              სწრაფი ძიება
            </h2>
            {menu.map((item) => (
              <p
                key={item.id}
                onClick={() => scrollToSection(item.target)}
                className="cursor-pointer text-myLightGray hover:text-myLightBlue duration-100 text-sm md:text-base"
              >
                {item.text}
              </p>
            ))}
          </div>

          {/* Other Info */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[20px] md:text-[25px] text-myGray font-semibold">
              დამატებითი ინფორმაცია
            </h2>
            {other.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="cursor-pointer text-myLightGray hover:text-myLightBlue duration-100 text-sm md:text-base"
              >
                {item.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
