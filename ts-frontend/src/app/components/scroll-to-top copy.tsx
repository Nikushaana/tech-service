"use client";

import React, { useEffect, useState } from "react";
import { CgScrollV } from "react-icons/cg";

export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 1000) {
      setShow(true);
    } else {
      setShow(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      onClick={scrollToTop}
      className={`${
        show ? "w-[50px] h-[50px] border-[1px] " : "w-0 h-0 border-0"
      } duration-200 fixed z-1 bottom-[20px] right-[20px] md:bottom-[50px] md:right-[50px]  bg-myLightBlue hover:bg-myBlue border-white text-white text-[25px] rounded-full flex items-center justify-center animate-bounce cursor-pointer`}
    >
      <CgScrollV />
    </div>
  );
}
