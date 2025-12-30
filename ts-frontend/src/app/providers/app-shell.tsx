"use client";

import { ToastContainer } from "react-toastify";
import BurgerMenu from "../components/burger-menu/burger-menu";
import Footer from "../components/footer";
import Header from "../components/header";
import ScrollToTop from "../components/scroll-to-top";
import AuthRehydrate from "../components/auth-rehydrate";
import LogOut from "../components/modals/log-out";
import CreateAddress from "../components/modals/create-address";
import CreateOrder from "../components/modals/create-order";
import UpdateOrder from "../components/modals/update-order";
import CreateReview from "../components/modals/create-review";
import { useEffect } from "react";
import { useAddressesStore } from "../store/useAddressesStore";
import { useOrdersStore } from "../store/useOrdersStore";
import { useReviewsStore } from "../store/useReviewsStore";
import { useAuthStore } from "../store/useAuthStore";
import { useUpdateOrderStore } from "../store/useUpdateOrderStore";
import { useBurgerMenuStore } from "../store/burgerMenuStore";
import OrderFlow from "../components/modals/order-flow";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { openCreateAddressModal } = useAddressesStore();
  const { openCreateOrderModal } = useOrdersStore();
  const { openCreateReviewModal } = useReviewsStore();
  const { openLogOut } = useAuthStore();
  const { openUpdateOrderModal } = useUpdateOrderStore();
  const { openAdminSideBar, isOpen, openSideBar } = useBurgerMenuStore();

  const isAnyModalOpen =
    openCreateAddressModal ||
    openCreateOrderModal ||
    openCreateReviewModal ||
    openLogOut ||
    openUpdateOrderModal ||
    openAdminSideBar ||
    isOpen ||
    openSideBar;

  useEffect(() => {
    document.body.style.overflow = isAnyModalOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAnyModalOpen]);

  return (
    <>
      <Header />

      <main className="w-full flex flex-col">{children}</main>

      <Footer />

      {/* Global UI */}
      <ScrollToTop />
      <BurgerMenu />
      <ToastContainer />

      {/* Auth */}
      <AuthRehydrate />

      {/* Modals */}
      <LogOut />
      <CreateAddress />
      <CreateOrder />
      <UpdateOrder />
      <CreateReview />
      <OrderFlow />
    </>
  );
}
