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
import { useOrderFlowStore } from "../store/useOrderFlowStore";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { openCreateAddressModal } = useAddressesStore();
  const { openCreateOrderModal } = useOrdersStore();
  const { openCreateReviewModal } = useReviewsStore();
  const { openLogOut, currentUser } = useAuthStore();
  const { openUpdateOrderModal } = useUpdateOrderStore();
  const { openAdminSideBar, isOpen, openSideBar } = useBurgerMenuStore();
  const { openOrderFlowModal } = useOrderFlowStore();

  const isAnyModalOpen =
    openCreateAddressModal ||
    openCreateOrderModal ||
    openCreateReviewModal ||
    openLogOut ||
    openUpdateOrderModal ||
    openAdminSideBar ||
    isOpen ||
    openSideBar ||
    openOrderFlowModal;

  useEffect(() => {
    document.body.style.overflow = isAnyModalOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAnyModalOpen]);

  // live socket catch
  useEffect(() => {
    if (!currentUser?.role || !currentUser?.id) return;

    const channel = `notification:${currentUser.role}:${currentUser.role == "admin" ? undefined : currentUser.id}`;

    const listener = () => {
      // Refetch the notification queries
      const role = currentUser.role;

      if (role === "company" || role === "individual") {
        queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
        queryClient.invalidateQueries({
          queryKey: ["userUnreadNotifications"],
        });
      }

      if (role === "technician" || role === "delivery") {
        queryClient.invalidateQueries({ queryKey: ["staffNotifications"] });
        queryClient.invalidateQueries({
          queryKey: ["staffUnreadNotifications"],
        });
      }

      if (role === "admin") {
        queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
        queryClient.invalidateQueries({
          queryKey: ["adminUnreadNotifications"],
        });
      }

      // Play sound
      const audio = new Audio("/sounds/light-hearted-message-tone.mp3");
      audio.play();
    };

    socket.on(channel, listener);

    return () => {
      socket.off(channel, listener);
    };
  }, [currentUser?.role, currentUser?.id]);

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
