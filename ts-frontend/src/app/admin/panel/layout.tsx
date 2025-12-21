"use client";

import { useBurgerMenuStore } from "@/app/store/burgerMenuStore";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";

const sidebarLinks = [
  { name: "მთავარი", href: "/admin/panel/main" },
  { name: "მომხმარებლების სერვისები", href: "/admin/panel/orders" },
  { name: "კატეგორიები", href: "/admin/panel/categories" },
  { name: "FAQs", href: "/admin/panel/faqs" },
  { name: "შეფასებები", href: "/admin/panel/reviews" },
  { name: "ფილიალები", href: "/admin/panel/branches" },
  { name: "მომხმარებლები", href: "/admin/panel/users" },
  { name: "თანამშრომლები", href: "/admin/panel/staff" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { currentUser, authLoading, toggleLogOut } = useAuthStore();

  const { openAdminSideBar, toggleAdminSideBar, closeAdminSideBar } =
    useBurgerMenuStore();

  return (
    <div className="flex flex-col items-center">
      <div
        className={`max-w-[1920px] w-full flex flex-col min-h-[100vh] p-[10px] gap-[10px] duration-100 ${
          authLoading && "brightness-70 blur-[2px] pointer-events-none"
        }`}
      >
        {/* Mobile Hamburger */}
        <div
          onClick={() => toggleAdminSideBar()}
          className={`lg:hidden flex items-center self-start justify-center text-2xl duration-300 h-[45px] aspect-square ${
            openAdminSideBar &&
            "rotate-[360deg] ml-64 bg-myLightBlue text-white rounded-[10px]"
          }`}
        >
          {openAdminSideBar ? <HiX /> : <HiMenu />}
        </div>

        <div className="flex gap-[10px] flex-1">
          {/* Sidebar */}
          <aside
            className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-64 bg-myLightBlue hover:bg-myBlue text-white flex flex-col px-[10px] py-[20px] shadow-xl rounded-r-xl lg:rounded-xl z-20 transform duration-150 
            ${
              openAdminSideBar
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
          >
            <h2 className="text-[20px] text-center font-bold tracking-wide">
              ადმინი
            </h2>
            {currentUser && (
              <p className="mb-8 text-center text-gray-200">
                {currentUser?.name +
                  " " +
                  currentUser?.lastName +
                  " " +
                  currentUser?.phone}
              </p>
            )}

            <nav
              className={`flex flex-col gap-2 mb-6 duration-300 w-full ${
                !authLoading ? "" : "ml-[-300px]"
              }`}
            >
              {sidebarLinks.map((link) => {
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
                    onClick={() => closeAdminSideBar()}
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
              openAdminSideBar && "pointer-events-none brightness-70"
            } flex-1 flex flex-col overflow-x-auto duration-200 bg-gray-50 p-2 border-[1px] rounded-xl shadow-inner`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
