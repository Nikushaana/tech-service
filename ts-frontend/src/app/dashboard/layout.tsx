"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa6";
import { useBurgerMenuStore } from "../store/burgerMenuStore";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchUserUnreadNotifications } from "../lib/api/userUnreadNotifications";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useLogOutStore } from "../store/useLogOutStore";
import { IoPersonSharp } from "react-icons/io5";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toggleLogOut } = useLogOutStore();
  const { data: currentUser, isLoading: authLoading } = useCurrentUser();
  const { openSideBar, toggleSideBar, closeSideBar } = useBurgerMenuStore();

  const role = currentUser?.role as ClientRole;

  const sidebarLinks = [
    { name: "პროფილი", href: `/dashboard/${role}/profile` },
    { name: "ჩემი განცხადებები", href: `/dashboard/${role}/orders` },
    { name: "მისამართები", href: `/dashboard/${role}/addresses` },
    { name: "შეტყობინებები", href: `/dashboard/${role}/notifications` },
    { name: "ტრანზაქციები", href: `/dashboard/${role}/transactions` },
    { name: "შეაფასე Techero", href: `/dashboard/${role}/reviews` },
  ];

  const { data: unreadNotifications } = useQuery({
    queryKey: ["userUnreadNotifications", role],
    queryFn: () => fetchUserUnreadNotifications(role),
    staleTime: 1000 * 60 * 10,
    enabled: !!role,
    retry: false,
  });

  return (
    <div className="flex flex-col items-center">
      <div
        className={`max-w-[1920px] w-full flex flex-col lg:flex-row min-h-[80vh] px-[10px] pb-[10px] gap-[10px] ${
          authLoading && "pointer-events-none"
        }`}
      >
        {/* Mobile Hamburger */}
        <Button
          onClick={() => toggleSideBar()}
          variant="secondary"
          size="icon"
          className={`lg:hidden sticky top-[10px] z-1 text-white bg-myLightBlue hover:bg-myBlue cursor-pointer rounded-lg`}
        >
          <FaChevronRight className="size-4" />
        </Button>

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
            className={`h-full w-[256px] flex flex-col bg-white px-4 lg:px-0 duration-200
            ${!openSideBar && "ml-[-256px] lg:ml-0"} ${authLoading && "pointer-events-none"}
          `}
          >
            <div className="sticky top-[30px] mt-[40px] flex flex-col gap-y-3 overflow-y-auto">
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
                <div className="flex flex-col items-center">
                  {currentUser?.role == "company" && (
                    <p className="text-[14px]">{currentUser?.companyName}</p>
                  )}
                  {currentUser?.role == "company" && (
                    <p className="">
                      {currentUser?.companyAgentName +
                        " " +
                        currentUser?.companyAgentLastName}
                    </p>
                  )}
                  {currentUser?.role == "individual" && (
                    <p className="">
                      {currentUser?.name + " " + currentUser?.lastName}
                    </p>
                  )}
                </div>
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
  );
}
