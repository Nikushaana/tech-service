"use client";

import { useBurgerMenuStore } from "@/app/store/burgerMenuStore";
import { useMenuStore } from "@/app/store/useMenuStore";
import { scrollToSection } from "@/app/utils/scroll";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BurgerMenu() {
  const menu = useMenuStore((state) => state.menu);
  const { isOpen, closeBurgerMenu } = useBurgerMenuStore();
  const { currentUser } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const path = currentUser
    ? currentUser.role === "individual"
      ? "/dashboard/individual/orders"
      : "/dashboard/company/orders"
    : "/auth/login";

  return (
    <div
      onClick={() => {
        closeBurgerMenu();
      }}
      className={`${
        isOpen ? "bg-[#000000a7] shadow-2xl shadow-[black]" : "pointer-events-none"
      } duration-300 inset-0 fixed z-50 w-[100vw] h-[100vh] overflow-hidden`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
      ${!isOpen && "ml-[-300px]"}      
          duration-100 bg-gray-100 h-full w-[300px] px-4 py-[20px] flex flex-col gap-6 overflow-hidden`}
      >
        <img
          src="/images/logo.png"
          alt="logo"
          className="h-[60px] aspect-square self-start"
        />

        <Link href={path}>
          <Button
            onClick={() => {
              closeBurgerMenu();
            }}
            className="flex cursor-pointer h-[45px] w-full"
          >
            {currentUser ? "აირჩიე სერვისი" : "ავტორიზაცია"}
          </Button>
        </Link>

        <nav className="flex flex-col gap-6">
          {menu.map((item) => (
            <h1
              key={item.id}
              onClick={() => {
                if (pathname.split("/")[1]) {
                  router.push("/");
                } else {
                  scrollToSection(item.target);
                  closeBurgerMenu();
                }
              }}
              className="cursor-pointer text-myLightGray hover:text-myLightBlue duration-100"
            >
              {item.text}
            </h1>
          ))}
        </nav>
      </div>
    </div>
  );
}
