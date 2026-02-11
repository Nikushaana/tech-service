"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../store/useAuthStore";
import { FaChevronRight } from "react-icons/fa6";
import { useBurgerMenuStore } from "../store/burgerMenuStore";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchUserUnreadNotifications } from "../lib/api/userUnreadNotifications";

type SidebarLinksWithTitle = {
  title?: string;
  links: { name: string; href: string }[];
};

const sidebarLinks: Record<ClientRole, SidebarLinksWithTitle> = {
  individual: {
    title: "ჩემი გვერდი", 
    links: [
      { name: "ჩემი სერვისები", href: "/dashboard/individual/orders" },
      { name: "მისამართები", href: "/dashboard/individual/addresses" },
      { name: "შეაფასე Tech Service", href: "/dashboard/individual/reviews" },
      { name: "პროფილი", href: "/dashboard/individual/profile" },
      { name: "შეტყობინებები", href: "/dashboard/individual/notifications" },
      { name: "ტრანზაქციები", href: "/dashboard/individual/transactions" },
    ],
  },
  company: {
    title: "ჩემი გვერდი",
    links: [
      { name: "ჩემი სერვისები", href: "/dashboard/company/orders" },
      { name: "მისამართები", href: "/dashboard/company/addresses" },
      { name: "შეაფასე Tech Service", href: "/dashboard/company/reviews" },
      { name: "პროფილი", href: "/dashboard/company/profile" },
      { name: "შეტყობინებები", href: "/dashboard/company/notifications" },
      { name: "ტრანზაქციები", href: "/dashboard/company/transactions" },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, authLoading, toggleLogOut } = useAuthStore();
  const { openSideBar, toggleSideBar, closeSideBar } = useBurgerMenuStore();

  const role = currentUser?.role as ClientRole;

  const sidebar =
    role && sidebarLinks[role]
      ? sidebarLinks[role]
      : { title: "იტვირთება..", links: [] };

  const { data: unreadNotifications } = useQuery({
    queryKey: ["userUnreadNotifications", role],
    queryFn: () => fetchUserUnreadNotifications(role),
    staleTime: 1000 * 60 * 10,
    retry: false
  });

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
          className={`lg:hidden fixed top-[40%] z-[2] rounded-r-[10px] shadow-lg border-[1px] flex items-center justify-center text-xl duration-300 h-[60px] w-[30px] ${
            openSideBar ? "left-[20px] bg-gray-300 " : "left-0 bg-gray-100 "
          }`}
        >
          <FaChevronRight />
        </div>

        <div className="flex gap-[10px] flex-1">
          {/* Sidebar */}
          <aside
            onClick={() => {
              closeSideBar();
            }}
            className={`fixed lg:static top-0 left-0 h-[100vh] w-[100vw] lg:h-auto lg:w-auto z-20 duration-300 ${
              openSideBar
                ? "bg-[#000000a7] "
                : "pointer-events-none lg:pointer-events-auto"
            } `}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`h-full w-[256px] bg-myLightBlue hover:bg-myBlue text-white flex flex-col px-[10px] py-[20px] shadow-xl rounded-r-xl lg:rounded-xl duration-100
            ${!openSideBar && "ml-[-256px] lg:ml-0"}
          `}
            >
              <div className="sticky top-[20px]">
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
                        className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium duration-200
              ${
                isActive
                  ? "bg-white text-myBlue"
                  : "hover:bg-myLightBlue hover:text-white"
              }
            `}
                        onClick={() => closeSideBar()}
                      >
                        {link.name}{" "}
                        {link.name == "შეტყობინებები" &&
                          unreadNotifications > 0 && (
                            <p className="bg-red-600 flex items-center justify-center rounded-full h-[10px] aspect-square"></p>
                          )}
                      </Link>
                    );
                  })}
                </nav>

                <Button
                  onClick={() => toggleLogOut()}
                  className={`mt-[40px] rounded-lg font-semibold text-[#1e40af] bg-white w-full
        hover:bg-[#b91c1c] hover:text-white duration-300 cursor-pointer ${
          !authLoading ? "" : "ml-[-300px]"
        }`}
                >
                  გასვლა
                </Button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main
            className={`flex-1 flex overflow-x-auto duration-200 bg-gray-50 p-2 border-[1px] rounded-xl shadow-inner`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
