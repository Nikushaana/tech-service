"use client";

import { HiMenu, HiX } from "react-icons/hi";
import { useMenuStore } from "../store/useMenuStore";
import { scrollToSection } from "../utils/scroll";
import { useBurgerMenuStore } from "../store/burgerMenuStore";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { IoPersonSharp } from "react-icons/io5";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchUserUnreadNotifications } from "../lib/api/userUnreadNotifications";

export default function Header() {
  const menu = useMenuStore((state) => state.menu);
  const { isOpen, toggleBurgerMenu } = useBurgerMenuStore();
  const pathname = usePathname();
  const router = useRouter();

  const { currentUser } = useAuthStore();

  const role = currentUser?.role as ClientRole;

  const { data: unreadNotifications } = useQuery({
    queryKey: ["userUnreadNotifications", role],
    queryFn: () => fetchUserUnreadNotifications(role),
    staleTime: 1000 * 60 * 10,
    retry: false
  });

  const firstSegment = pathname.split("/")[1];
  const isHidden = firstSegment === "admin" || firstSegment === "staff";

  const path = currentUser
    ? currentUser.role === "individual"
      ? "/dashboard/individual/orders"
      : "/dashboard/company/orders"
    : "/auth/login";

  return (
    <header className={`z-10 w-full ${isHidden ? "hidden" : ""}`}>
      <div className="max-w-[1140px] mx-auto flex items-center justify-between h-[100px] px-4">
        <Link href={"/"}>
          <img src="/images/logo.png" alt="logo" className="h-[60px]" />
        </Link>

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
        <div className="flex items-center gap-[10px] duration-200">
          <Link href={path}>
            <Button className="hidden md:flex cursor-pointer h-[45px] px-[20px] sm:px-[30px]">
              {currentUser ? "აირჩიე სერვისი" : "ავტორიზაცია"}
            </Button>
          </Link>

          <Link
            href={`/dashboard/${currentUser?.role}/profile`}
            className={`${
              currentUser ? "w-[45px] h-[45px]" : "w-0 h-0"
            } relative group`}
          >
            <div className="w-full h-full overflow-hidden rounded-full bg-myLightBlue group-hover:bg-myBlue duration-200  text-white flex items-center justify-center text-[18px] ">
              {currentUser?.images && currentUser?.images[0] ? (
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
            {unreadNotifications > 0 && (
              <p className="absolute -top-2 -right-2 bg-red-600 flex items-center justify-center rounded-full px-[8px] py-[2px] text-sm text-white">
                {unreadNotifications}
              </p>
            )}
          </Link>

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
