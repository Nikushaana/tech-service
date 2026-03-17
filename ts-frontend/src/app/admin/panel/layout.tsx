"use client";

import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { fetchAdminUnreadNotifications } from "@/app/lib/api/adminUnreadNotifications";
import { useBurgerMenuStore } from "@/app/store/burgerMenuStore";
import { useLogOutStore } from "@/app/store/useLogOutStore";
import { formatPhone } from "@/app/utils/formatPhone";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";

const sidebarLinks = [
  { name: "მთავარი", href: "/admin/panel/main" },
  { name: "განცხადებები", href: "/admin/panel/orders" },
  { name: "შეტყობინებები", href: "/admin/panel/notifications" },
  { name: "მომხმარებლები", href: "/admin/panel/users" },
  { name: "თანამშრომლები", href: "/admin/panel/staff" },
  { name: "ტრანზაქციები", href: "/admin/panel/transactions" },
  { name: "ფილიალები", href: "/admin/panel/branches" },
  { name: "კატეგორიები", href: "/admin/panel/categories" },
  { name: "FAQs", href: "/admin/panel/faqs" },
  { name: "შეფასებები", href: "/admin/panel/reviews" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { data: currentUser, isLoading: authLoading } = useCurrentUser();

  const { toggleLogOut } = useLogOutStore();

  const { openAdminSideBar, toggleAdminSideBar, closeAdminSideBar } =
    useBurgerMenuStore();

  const { data: unreadNotifications } = useQuery({
    queryKey: ["adminUnreadNotifications"],
    queryFn: () => fetchAdminUnreadNotifications(),
    staleTime: 1000 * 60 * 10,
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
          onClick={() => toggleAdminSideBar()}
          className="relative lg:hidden self-end "
        >
          <div
            className={`flex items-center justify-center text-2xl duration-300 h-[45px] aspect-square ${
              openAdminSideBar && "rotate-[180deg]"
            }`}
          >
            {openAdminSideBar ? <HiX /> : <HiMenu />}
          </div>
          {unreadNotifications > 0 && (
            <p className="absolute top-0 right-0 bg-red-600 flex items-center justify-center rounded-full h-[10px] aspect-square"></p>
          )}
        </div>

        <div className="flex gap-[10px] flex-1">
          {/* Sidebar */}
          <aside
            onClick={() => {
              closeAdminSideBar();
            }}
            className={`fixed lg:static top-0 left-0 h-[100vh] w-[100vw] lg:h-auto lg:w-auto z-20 duration-300 ${
              openAdminSideBar
                ? "bg-[#000000a7]"
                : "pointer-events-none lg:pointer-events-auto"
            }`}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`h-full w-[256px] flex flex-col bg-white px-4 lg:px-0 duration-200
            ${!openAdminSideBar && "ml-[-256px] lg:ml-0"} ${authLoading && "pointer-events-none"}
          `}
            >
              <div className="sticky top-[20px] flex flex-col gap-y-3 overflow-y-auto">
                <img
                  src="/images/logo.webp"
                  alt="logo"
                  className="h-[60px] object-contain cursor-pointer self-center"
                />
                <hr />
                <div className="flex flex-col gap-y-2 items-center">
                  {currentUser && (
                    <div className="flex flex-col items-center">
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
                        className={`flex items-center justify-between px-4 py-2 rounded-full text-sm duration-200 ${
                          isActive
                            ? "bg-myLightBlue text-white"
                            : "hover:bg-myLightBlue hover:text-white"
                        }`}
                        onClick={() => closeAdminSideBar()}
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
            className={`flex-1 flex flex-col overflow-x-auto bg-gray-50 py-[26px] px-[20px] sm:p-[34px] rounded-[30px] shadow-inner`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
