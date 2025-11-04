"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "../components/ui/button";
import { HiMenu, HiX } from "react-icons/hi";
import { useBurgerMenuStore } from "../store/burgerMenuStore";

type SidebarLinksWithTitle = {
  title?: string;
  links: { name: string; href: string }[];
};

type Role = "individual" | "company";

const sidebarLinks: Record<Role, SidebarLinksWithTitle> = {
  individual: {
    title: "ჩემი გვერდი",
    links: [
      { name: "ჩემი სერვისები", href: "/dashboard/individual/orders" },
      { name: "მისამართები", href: "/dashboard/individual/addresses" },
      { name: "შეაფასე Tech Service", href: "/dashboard/individual/reviews" },
      { name: "პროფილი", href: "/dashboard/individual/profile" },
    ],
  },
  company: {
    title: "კომპანიის გვერდი",
    links: [
      { name: "ჩემი სერვისები", href: "/dashboard/company/orders" },
      { name: "მისამართები", href: "/dashboard/company/addresses" },
      { name: "შეაფასე Tech Service", href: "/dashboard/company/reviews" },
      { name: "პროფილი", href: "/dashboard/company/profile" },
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

  useEffect(() => {
    if (openSideBar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openSideBar]);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`max-w-[1920px] w-full flex flex-col min-h-[80vh] mt-[20px] mb-[100px] px-[10px] gap-[10px] duration-100 ${
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
            <h2 className="text-[20px] text-center font-bold mb-8 tracking-wide">
              {sidebar.title}
            </h2>

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
            } flex-1 flex overflow-x-auto duration-200 bg-gray-50 px-[10px] py-[20px] sm:p-[20px] border-[1px] rounded-xl shadow-inner`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
