"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useBurgerMenuStore } from "@/app/store/burgerMenuStore";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/app/utils/formatPhone";
import { useQuery } from "@tanstack/react-query";
import { axiosDelivery, axiosTechnician } from "@/app/lib/api/axios";

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
      { name: "შეტყობინებები", href: "/staff/technician/notifications" },
    ],
  },
  delivery: {
    title: "კურიერის გვერდი",
    links: [
      { name: "ჩემი სერვისები", href: "/staff/delivery/orders" },
      { name: "პროფილი", href: "/staff/delivery/profile" },
      { name: "შეტყობინებები", href: "/staff/delivery/notifications" },
    ],
  },
};

const fetchStaffUnreadNotifications = async (role?: string) => {
  if (!role) return 0;
  const { data } = await (role == "technician"
    ? axiosTechnician
    : axiosDelivery
  ).get(`${role}/notifications/unread`);
  return data;
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

  const { data: unreadNotifications } = useQuery({
    queryKey: ["staffUnreadNotifications", role],
    queryFn: () => fetchStaffUnreadNotifications(role),
    staleTime: 1000 * 60 * 10,
  });

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
          className="relative lg:hidden self-end "
        >
        <div
          className={`flex items-center justify-center text-2xl duration-300 h-[45px] aspect-square ${
            openSideBar && "rotate-[360deg]"
          }`}
        >
          {openSideBar ? <HiX /> : <HiMenu />}
        </div>
        {unreadNotifications > 0 && (
            <p className="absolute -top-2 -right-2 bg-red-600 flex items-center justify-center rounded-full px-[8px] py-[2px] text-sm text-white">
              {unreadNotifications}
            </p>
          )}
        </div>

        <div className="flex gap-[10px] flex-1">
          {/* Sidebar */}
          <aside
            onClick={() => {
              closeSideBar();
            }}
            className={`fixed lg:static top-0 left-0 h-[100vh] w-[100vw] lg:h-auto lg:w-auto z-20 duration-300 ${
              openSideBar
                ? "bg-[#000000a7]"
                : "pointer-events-none lg:pointer-events-auto"
            }`}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`h-full w-[256px] bg-myLightBlue hover:bg-myBlue text-white flex flex-col px-[10px] py-[20px] shadow-xl rounded-r-xl lg:rounded-xl duration-100
            ${!openSideBar && "ml-[-256px] lg:ml-0"}
          `}
            >
              <h2 className="text-[20px] text-center font-bold tracking-wide">
                {sidebar.title}
              </h2>
              {currentUser && (
                <p className="mb-8 text-center text-gray-200">
                  {formatPhone(
                    currentUser?.name +
                      " " +
                      currentUser?.lastName +
                      " " +
                      currentUser?.phone
                  )}
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
                          <p className="bg-red-600 flex items-center justify-center rounded-full h-full px-[7px] text-white">
                            {unreadNotifications}
                          </p>
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
