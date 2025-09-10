"use client";

import React from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { Button } from "./ui/button";
import { useMenuStore } from "../store/useMenuStore";
import { scrollToSection } from "../utils/scroll";
import { useBurgerMenuStore } from "../store/burgerMenuStore";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { IoPersonSharp } from "react-icons/io5";

export default function Header() {
  const menu = useMenuStore((state) => state.menu);
  const { isOpen, toggleBurgerMenu } = useBurgerMenuStore();
  const pathname = usePathname();
  const router = useRouter();

  const { currentUser } = useAuthStore();

  return (
    <header
      className={`z-10 w-full ${
        pathname.split("/")[1] === "admin" ? "hidden" : ""
      }`}
    >
      <div className="max-w-[1140px] mx-auto flex items-center justify-between h-[100px] px-4">
        <img
          onClick={() => {
            router.push("/");
          }}
          src="/images/logo.png"
          alt="logo"
          className="h-[60px] cursor-pointer"
        />

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6">
          {menu.map((item) => (
            <h1
              key={item.id}
              onClick={() => {
                if (pathname.split("/")[1]) {
                  router.push("/");
                } else {
                  scrollToSection(item.target);
                }
              }}
              className={`${
                pathname.split("/")[1] ? "text-myGray" : "text-white"
              } cursor-pointer hover:text-myLightBlue duration-100`}
            >
              {item.text}
            </h1>
          ))}
        </nav>

        {/* Request Button (Desktop) */}
        <div
          className={`flex items-center duration-200 ${
            currentUser ? "gap-[10px]" : "gap-0"
          }`}
        >
          <Button
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
            className="hidden md:flex h-[45px] px-[20px] sm:px-[30px] cursor-pointer"
          >
            მოითხოვე სერვისი
          </Button>

          <div
            onClick={() => {
              // Navigate to the dashboard based on user role
              if (currentUser?.role === "individual")
                router.push("/dashboard/individual/profile");
              else if (currentUser?.role === "company")
                router.push("/dashboard/company/profile");
              else if (currentUser?.role === "technician")
                router.push("/dashboard/technician/profile");
            }}
            className={`${
              currentUser ? "w-[45px] h-[45px]" : "w-0 h-0"
            } rounded-full hover:scale-105 duration-200 cursor-pointer overflow-hidden bg-myLightBlue text-white flex items-center justify-center text-[18px]`}
          >
            {currentUser?.images ? (
              <img
                onClick={() => {
                  router.push("/");
                }}
                src={currentUser?.images[0]}
                alt="logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <IoPersonSharp />
            )}
          </div>

          {/* Mobile Hamburger */}
          <div
            onClick={toggleBurgerMenu}
            className={`md:hidden flex items-center justify-center ${
              pathname.split("/")[2] ? "text-myGray" : "text-white"
            } text-2xl duration-150 h-[45px] aspect-square ${
              isOpen && "rotate-[180deg]"
            }`}
          >
            {isOpen ? <HiX /> : <HiMenu />}
          </div>
        </div>
      </div>
    </header>
  );
}
