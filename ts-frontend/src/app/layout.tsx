import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";
import ScrollToTop from "./components/scroll-to-top";
import BurgerMenu from "./components/burger-menu/burger-menu";
import { ToastContainer } from "react-toastify";
import LogOut from "./components/modals/log-out";
import CreateAddress from "./components/modals/create-address";
import CreateOrder from "./components/modals/create-order";
import AuthRehydrate from "./components/auth-rehydrate";
import { LoadScript } from "@react-google-maps/api";

export const metadata: Metadata = {
  title: "Tech Service | საოჯახო ტექნიკის სერვის-ცენტრი",
  description: "სერვისი დაგეხმარება საოჯახო ტექნიკის შეკეთებაში",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center ">
        <Header />
        <div className="w-full flex flex-col">{children}</div>
        <Footer />
        {/* other components */}
        <ScrollToTop />
        <BurgerMenu />
        <ToastContainer />
        <AuthRehydrate />
        <LogOut />
        <CreateAddress />
        <CreateOrder />
      </body>
    </html>
  );
}
