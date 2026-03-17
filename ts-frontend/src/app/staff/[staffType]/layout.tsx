"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";
import { useBurgerMenuStore } from "@/app/store/burgerMenuStore";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/app/utils/formatPhone";
import { useQuery } from "@tanstack/react-query";
import { fetchStaffUnreadNotifications } from "@/app/lib/api/staffUnreadNotifications";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { useLogOutStore } from "@/app/store/useLogOutStore";
import { IoPersonSharp } from "react-icons/io5";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toggleLogOut } = useLogOutStore();
  const { data: currentUser, isLoading: authLoading } = useCurrentUser();
  const { openSideBar, toggleSideBar, closeSideBar } = useBurgerMenuStore();

  const role = currentUser?.role as StaffRole;

  const sidebarLinks = [
    { name: "პროფილი", href: `/staff/${role}/profile` },
    { name: "ჩემი განცხადებები", href: `/staff/${role}/orders` },
    { name: "შეტყობინებები", href: `/staff/${role}/notifications` },
  ];

  const { data: unreadNotifications } = useQuery({
    queryKey: ["staffUnreadNotifications", role],
    queryFn: () => fetchStaffUnreadNotifications(role),
    staleTime: 1000 * 60 * 10,
    enabled: !!role,
    retry: false,
  });

  return (
    <div className="flex flex-col items-center">
      <div
        className={`max-w-[1920px] w-full flex flex-col min-h-[100vh] p-[10px] gap-[10px] ${
          authLoading && "pointer-events-none"
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
            <p className="absolute top-0 right-0 bg-red-600 flex items-center justify-center rounded-full h-[10px] aspect-square"></p>
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
              className={`h-full w-[256px] flex flex-col bg-white px-4 lg:px-0 duration-200
            ${!openSideBar && "ml-[-256px] lg:ml-0"} ${authLoading && "pointer-events-none"}
          `}
            >
              <div className="sticky top-[20px] flex flex-col gap-y-3">
                <img
                  src="/images/logo.webp"
                  alt="logo"
                  className="h-[60px] object-contain cursor-pointer self-center"
                />
                <hr />

                <div className="flex flex-col gap-y-2 items-center">
                  <div className="w-[60px] h-[60px] overflow-hidden rounded-full bg-myLightBlue group-hover:bg-myBlue duration-200  text-white flex items-center justify-center text-[18px] ">
                    {currentUser?.images && currentUser?.images[0] ? (
                      <img
                        src={currentUser?.images[0]}
                        alt="logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <IoPersonSharp />
                    )}
                  </div>
                  {currentUser && (
                    <div className="flex flex-col items-center">
                      <p className="text-[13px]">
                        {role == "technician" ? "ტექნიკოსი" : "კურიერი"}
                      </p>
                      <p className="">
                        {currentUser?.name + " " + currentUser?.lastName}
                      </p>
                      <p className="">{formatPhone(currentUser?.phone)}</p>
                    </div>
                  )}
                </div>

                <hr />

                <nav className={`flex flex-col gap-2 w-full `}>
                  {sidebarLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center justify-between px-4 py-2 rounded-full text-sm duration-200
              ${
                isActive
                  ? "bg-myLightBlue text-white"
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

                <hr />

                <Button
                  onClick={() => toggleLogOut()}
                  variant="outline"
                  className={`border-red-600 text-red-600 hover:text-white w-full
        hover:bg-red-600 duration-300 cursor-pointer`}
                >
                  გასვლა
                </Button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main
            className={`flex-1 flex overflow-x-auto bg-gray-50 py-[26px] px-[20px] sm:p-[34px] rounded-[30px] shadow-inner`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
