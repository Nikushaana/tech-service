"use client";

import { toast, ToastContainer } from "react-toastify";
import BurgerMenu from "../components/burger-menu/burger-menu";
import Footer from "../components/footer";
import Header from "../components/header";
import ScrollToTop from "../components/scroll-to-top";
import LogOut from "../components/modals/log-out";
import CreateAddress from "../components/modals/create-address";
import CreateOrder from "../components/modals/create-order";
import UpdateOrder from "../components/modals/update-order";
import CreateReview from "../components/modals/create-review";
import { Suspense, useEffect } from "react";
import { useAddressesStore } from "../store/useAddressesStore";
import { useOrdersStore } from "../store/useOrdersStore";
import { useReviewsStore } from "../store/useReviewsStore";
import { useUpdateOrderStore } from "../store/useUpdateOrderStore";
import { useBurgerMenuStore } from "../store/burgerMenuStore";
import OrderFlow from "../components/modals/order-flow";
import { useOrderFlowStore } from "../store/useOrderFlowStore";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useLogOutStore } from "../store/useLogOutStore";
import { usePathname, useRouter } from "next/navigation";
import { api } from "../lib/api/axios";
import OrderMedia from "../components/modals/order-media";
import { useOrderMediaStore } from "../store/useOrderMediaStore";
import FilterOrders from "../components/modals/filter-modals/filter-orders";
import FilterNotifications from "../components/modals/filter-modals/filter-notifications";
import { useNotificationsStore } from "../store/useNotificationStore";
import FilterTransactions from "../components/modals/filter-modals/filter-transactions";
import { useTransactionsStore } from "../store/useTransactionStore";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: currentUser, isFetched } = useCurrentUser();

  const queryClient = useQueryClient();

  const { openCreateAddressModal } = useAddressesStore();
  const { openCreateOrderModal, openFilterOrderModal } = useOrdersStore();
  const { openCreateReviewModal } = useReviewsStore();
  const { openLogOut } = useLogOutStore();
  const { openUpdateOrderModal } = useUpdateOrderStore();
  const { openAdminSideBar, isOpen, openSideBar } = useBurgerMenuStore();
  const { currentIndex } = useOrderMediaStore();
  const { openOrderFlowModal } = useOrderFlowStore();
  const { openFilterNotificationModal } = useNotificationsStore();
  const { openFilterTransactionModal } = useTransactionsStore();

  const isAnyModalOpen =
    openCreateAddressModal ||
    openCreateOrderModal ||
    openFilterOrderModal ||
    openFilterNotificationModal ||
    openFilterTransactionModal ||
    openCreateReviewModal ||
    openLogOut ||
    openUpdateOrderModal ||
    openAdminSideBar ||
    isOpen ||
    openSideBar ||
    currentIndex !== null ||
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

    const listener = ({ type }: { type: string }) => {
      // Refetch the notification queries
      const role = currentUser.role;

      // Play sound
      const audio = new Audio("/sounds/light-hearted-message-tone.mp3");

      if (role === "company" || role === "individual") {
        queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
        queryClient.invalidateQueries({
          queryKey: ["userUnreadNotifications"],
        });
        queryClient.invalidateQueries({
          queryKey: ["userTransactions"],
        });
        if (type == "profile_updated") {
          queryClient.invalidateQueries({
            queryKey: ["currentUser"],
          });
        }
        if (type == "order_updated") {
          queryClient.invalidateQueries({ queryKey: ["userOrders"] });
          queryClient.invalidateQueries({ queryKey: ["userOrder"] });
        }
        if (type == "profile_updated" || type == "order_updated") {
          audio.play().catch(() => {});
          toast.success(`ახალი შეტყობინება`);
        }
      }

      if (role === "technician" || role === "delivery") {
        queryClient.invalidateQueries({ queryKey: ["staffNotifications"] });
        queryClient.invalidateQueries({
          queryKey: ["staffUnreadNotifications"],
        });
        if (type == "profile_updated") {
          queryClient.invalidateQueries({
            queryKey: ["currentUser"],
          });
        }
        if (type == "order_updated") {
          queryClient.invalidateQueries({ queryKey: ["staffOrders"] });
          queryClient.invalidateQueries({ queryKey: ["staffOrder"] });
        }
        if (type == "profile_updated" || type == "order_updated") {
          audio.play().catch(() => {});
          toast.success(`ახალი შეტყობინება`);
        }
      }

      if (role === "admin") {
        queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
        queryClient.invalidateQueries({
          queryKey: ["adminUnreadNotifications"],
        });
        if (type == "new_user") {
          queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
        }
        if (type == "new_order" || type == "order_updated") {
          queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
          queryClient.invalidateQueries({ queryKey: ["adminOrder"] });
          queryClient.invalidateQueries({
            queryKey: ["adminTransactions"],
          });
        }
        if (type == "new_review") {
          queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
        }
        if (type == "new_user" || type == "new_order" || type == "new_review") {
          audio.play().catch(() => {});
          toast.success(`ახალი შეტყობინება`);
        }
      }
    };

    socket.on(channel, listener);

    return () => {
      socket.off(channel, listener);
    };
  }, [currentUser]);

  useEffect(() => {
    // If still isFetched, do nothing
    if (!isFetched) return;

    // No user or missing role
    if (!currentUser?.role) {
      if (pathname.startsWith("/admin/")) router.push("/admin");
      else if (pathname.startsWith("/staff/")) router.push("/staff");
      else if (pathname.startsWith("/dashboard")) router.push("/auth/login");
      return;
    }

    if (currentUser?.role) {
      if (pathname === "/admin" && currentUser?.role === "admin")
        router.push("/admin/panel/main");
      else if (
        pathname === "/staff" &&
        ["delivery", "technician"].includes(currentUser?.role)
      )
        router.push(`/staff/${currentUser?.role}/orders`);
      else if (
        pathname.startsWith("/auth") &&
        ["company", "individual"].includes(currentUser?.role)
      )
        router.push(`/dashboard/${currentUser?.role}/profile`);

      let invalid = false;

      if (pathname.startsWith("/staff")) {
        invalid = !["delivery", "technician"].includes(currentUser.role);
      } else if (pathname.startsWith("/admin")) {
        invalid = currentUser.role !== "admin";
      } else {
        // any other page
        invalid = !["individual", "company"].includes(currentUser.role);
      }

      if (invalid) {
        if (pathname.startsWith("/admin/")) router.push("/admin");
        else if (pathname.startsWith("/staff/")) router.push("/staff");
        else if (pathname.startsWith("/dashboard")) router.push("/auth/login");
        api.post("auth/logout");
        queryClient.setQueryData(["currentUser"], null);
      }
    }
  }, [currentUser, isFetched, pathname, router]);

  return (
    <>
      <Header />

      <main className="w-full flex flex-col">{children}</main>

      <Footer />

      {/* Global UI */}
      <ScrollToTop />
      <BurgerMenu />
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Modals */}
      <LogOut />
      <CreateAddress />
      <CreateOrder />

      {openFilterOrderModal && (
        <Suspense fallback={null}>
          <FilterOrders />
        </Suspense>
      )}

      {openFilterNotificationModal && (
        <Suspense fallback={null}>
          <FilterNotifications />
        </Suspense>
      )}

      {openFilterTransactionModal && (
        <Suspense fallback={null}>
          <FilterTransactions />
        </Suspense>
      )}

      <UpdateOrder />
      <CreateReview />
      <OrderMedia />
      <OrderFlow />
    </>
  );
}
