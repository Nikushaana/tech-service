"use client";

import { BsInstagram } from "react-icons/bs";
import { FiFacebook } from "react-icons/fi";
import { FiYoutube } from "react-icons/fi";
import { useMenuStore } from "../store/useMenuStore";
import { scrollToSection } from "../utils/scroll";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();
  const menu = useMenuStore((state) => state.menu);

  const socialLinks = [
    { id: 1, icon: FiFacebook, link: "https://facebook.com/techero" },
    { id: 2, icon: BsInstagram, link: "https://instagram.com/techero" },
    { id: 3, icon: FiYoutube, link: "https://youtube.com/techero" },
  ];

  const other = [
    { id: 1, text: "ჩვენს შესახებ", url: "/about-us" },
    { id: 2, text: "კონფიდენციალურობის პოლიტიკა", url: "/privacy-policy" },
    { id: 3, text: "წესები და პირობები", url: "/terms-and-conditions" },
  ];

  const firstSegment = pathname.split("/")[1];
  const isHidden = firstSegment === "admin" || firstSegment === "staff" || firstSegment === "dashboard";

  return (
    <footer
      className={`w-full px-4 ${isHidden ? "hidden" : ""} bg-myLightBlue`}
    >
      <div className="max-w-[1140px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 py-12">
          {/* Logo & Social */}
          <div className="gap-7 sm:col-span-2 md:col-span-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1">
            <div className="space-y-7">
              <div>
                <img
                  src="/images/whiteLogo.webp"
                  alt="logo"
                  className="h-[60px]"
                />
              </div>
              <div className="flex flex-col gap-y-[10px]">
                <p className="text-gray-200 hover:text-gray-300 duration-100 text-sm md:text-base">
                  +995 592 803 023
                </p>
                <p className="text-gray-200 hover:text-gray-300 duration-100 text-sm md:text-base">
                  info@techero.ge
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-white">გამოგვყევით</h2>
              <div className="flex gap-3">
                {socialLinks.map(({ id, icon: Icon, link }) => (
                  <a
                    key={id}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#ffffff28] text-gray-200 text-[19px] w-10 h-10 rounded-full cursor-pointer flex items-center justify-center"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h1 className="text-[20px] md:text-[22px] text-white">
              სწრაფი ძიება
            </h1>
            {menu.map((item) => (
              <p
                key={item.id}
                onClick={() => scrollToSection(item.target)}
                className="cursor-pointer text-gray-200 hover:text-gray-300 duration-100 text-sm md:text-base"
              >
                {item.text}
              </p>
            ))}
          </div>

          {/* Other Info */}
          <div className="flex flex-col gap-3">
            <h1 className="text-[20px] md:text-[22px] text-white">
              დამატებითი ინფორმაცია
            </h1>
            {other.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="cursor-pointer text-gray-200 hover:text-gray-300 duration-100 text-sm md:text-base"
              >
                {item.text}
              </Link>
            ))}
          </div>
        </div>
        <hr className="bg-white" />
        <div className="flex justify-center gap-1 text-white text-[14px] py-3">
          <p className="text-[19px]">©</p>
          <p className="pt-0.5">2026 Techore </p>
        </div>
      </div>
    </footer>
  );
}
