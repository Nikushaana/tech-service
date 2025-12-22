"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useBurgerMenuStore } from "@/app/store/burgerMenuStore";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/app/utils/phone";

type SidebarLinksWithTitle = {
  title?: string;
  links: { name: string; href: string }[];
};

type Role = "technician" | "delivery";

const sidebarLinks: Record<Role, SidebarLinksWithTitle> = {
  technician: {
    title: "ტექნიკოსის გვერდი",
    links: [
      { name: "ჩემი სერვისები", href: "/staff/technician/orders" },
      { name: "პროფილი", href: "/staff/technician/profile" },
    ],
  },
  delivery: {
    title: "კურიერის გვერდი",
    links: [
      { name: "ჩემი სერვისები", href: "/staff/delivery/orders" },
      { name: "პროფილი", href: "/staff/delivery/profile" },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, authLoading, toggleLogOut } = useAuthStore();
  const { openSideBar, toggleSideBar, closeSideBar } = useBurgerMenuStore();

  const role = currentUser?.role as Role | undefined;

  const sidebar =
    role && sidebarLinks[role]
      ? sidebarLinks[role]
      : { title: "იტვირთება..", links: [] };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`max-w-[1920px] w-full flex flex-col min-h-[100vh] p-[10px] gap-[10px] duration-100 ${
          authLoading && "brightness-70 blur-[2px] pointer-events-none"
        }`}
      >
        {/* Mobile Hamburger */}
        <div
          onClick={() => toggleSideBar()}
          className={`lg:hidden flex items-center self-start justify-center text-2xl duration-300 h-[45px] aspect-square ${
            openSideBar &&
            "rotate-[360deg] ml-64 bg-myLightBlue text-white rounded-[10px]"
          }`}
        >
          {openSideBar ? <HiX /> : <HiMenu />}
        </div>

        <div className="flex gap-[10px] flex-1">
          {/* Sidebar */}
          <aside
            className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-64 bg-myLightBlue hover:bg-myBlue text-white flex flex-col px-[10px] py-[20px] shadow-xl rounded-r-xl lg:rounded-xl z-20 transform duration-150 
            ${
              openSideBar
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
          >
            <h2 className="text-[20px] text-center font-bold tracking-wide">
              {sidebar.title}
            </h2>
            {currentUser && (
              <p className="mb-8 text-center text-gray-200">
                {formatPhone(currentUser?.name +
                  " " +
                  currentUser?.lastName +
                  " " +
                  currentUser?.phone)}
              </p>
            )}

            <nav
              className={`flex flex-col gap-2 mb-6 duration-300 w-full ${
                !authLoading ? "" : "ml-[-300px]"
              }`}
            >
              {sidebar.links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium duration-200
              ${
                isActive
                  ? "bg-white text-myBlue"
                  : "hover:bg-myLightBlue hover:text-white"
              }
            `}
                    onClick={() => closeSideBar()}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <Button
              onClick={() => toggleLogOut()}
              className={`mt-auto rounded-lg font-semibold text-[#1e40af] bg-white w-full
        hover:bg-[#b91c1c] hover:text-white duration-300 cursor-pointer ${
          !authLoading ? "" : "ml-[-300px]"
        }`}
            >
              გასვლა
            </Button>
          </aside>

          {/* Main content */}
          <main
            className={`${
              openSideBar && "pointer-events-none brightness-70"
            } flex-1 flex overflow-x-auto duration-200 bg-gray-50 p-2 border-[1px] rounded-xl shadow-inner`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
