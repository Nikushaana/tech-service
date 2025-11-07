"use client";

import { Button } from "@/app/components/ui/button";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useCategoriesStore } from "@/app/store/useCategoriesStore";
import { useOrdersStore } from "@/app/store/useOrdersStore";
import { statusTranslations } from "@/app/utils/status-translations";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { BsEye } from "react-icons/bs";
import { LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";
import Link from "next/link";

export default function Page() {
  const { userType } = useParams<{
    userType: "company" | "individual";
  }>();

  const { currentUser } = useAuthStore();
  const { orders, fetchOrders, toggleOpenCreateOrderModal, loading } =
    useOrdersStore();
  const { fetchAddresses } = useAddressesStore();
  const { fetchCategories } = useCategoriesStore();

  useEffect(() => {
    fetchOrders(userType); // fetch correct type on mount
    fetchAddresses(userType);
    fetchCategories();
  }, [userType]);

  if (loading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className={`w-full flex flex-col gap-y-[30px] items-center`}>
      <Button
        onClick={() => {
          if (currentUser?.status) {
            toggleOpenCreateOrderModal(userType);
          } else {
            toast.error(
              "თქვენ ვერ დაამატებთ შეკვეთას, რადგან თქვენი პროფილი გასააქტიურებელია",
              { position: "bottom-right", autoClose: 3000 }
            );
          }
        }}
        className={`cursor-pointer ${
          orders.length > 0 ? "h-[40px]" : "text-lg h-[50px]"
        }`}
      >
        <LuPlus
          className={`${orders.length > 0 ? "text-[18px]" : "text-[22px]"}`}
        />{" "}
        აირჩიე სერვისი
      </Button>

      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">ჩემი სერვისები</h2>
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[900px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">ტიპი</TableHead>
                <TableHead className="font-semibold">კატეგორია</TableHead>
                <TableHead className="font-semibold">ბრენდი</TableHead>
                <TableHead className="font-semibold">მოდელი</TableHead>
                <TableHead className="font-semibold">სტატუსი</TableHead>
                <TableHead className="font-semibold">
                  განაცხადის თარიღი
                </TableHead>
                <TableHead className="font-semibold">
                  ცვლილების თარიღი
                </TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.service_type}</TableCell>
                    <TableCell>{order.category.name}</TableCell>
                    <TableCell>{order.brand}</TableCell>
                    <TableCell>{order.model}</TableCell>
                    <TableCell>
                      {statusTranslations[order.status] || order.status}
                    </TableCell>
                    <TableCell>
                      {dayjs(order.created_at).format("DD.MM.YYYY HH:mm")}
                    </TableCell>
                    <TableCell>
                      {dayjs(order.updated_at).format("DD.MM.YYYY HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/${userType}/orders/${order.id}`}>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          <BsEye className="size-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
