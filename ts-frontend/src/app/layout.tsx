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
import CreateReview from "./components/modals/create-review";
import UpdateOrder from "./components/modals/update-order";
import QueryProvider from "./providers/providers";

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
        <QueryProvider>
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
          <UpdateOrder />
          <CreateReview />
        </QueryProvider>
      </body>
    </html>
  );
}
