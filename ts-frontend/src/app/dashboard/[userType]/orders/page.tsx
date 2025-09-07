"use client";

import { Button } from "@/app/components/ui/button";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useCategoriesStore } from "@/app/store/useCategoriesStore";
import { useOrdersStore } from "@/app/store/useOrdersStore";
import { statusTranslations } from "@/app/utils/status-translations";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { BiCategory } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import { LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";

interface PageProps {
  params: Promise<{
    userType: "company" | "individual";
  }>;
}

export default function Page({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { userType } = resolvedParams;

  const router = useRouter();

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

  return (
    <div
      className={`w-full flex flex-col gap-y-[30px] items-center ${
        (loading || orders.length == 0) && "justify-center"
      }`}
    >
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <>
          {orders.length == 0 && (
            <p className="text-2xl font-semibold text-myLightGray text-center">
              შეკვეთა ჯერ არ გაქვს დამატებული
            </p>
          )}
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
            შეკვეთის დამატება
          </Button>

          {orders.length > 0 && (
            <div className="flex flex-col gap-[20px] w-full">
              {orders.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-transform duration-200 transform hover:-translate-y-1 rounded-xl p-[14px] flex flex-col gap-[10px]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[45px] aspect-square rounded-full bg-gray-100 text-myLightBlue text-[24px] flex items-center justify-center">
                        <BiCategory />
                      </div>
                      <h2 className="text-[20px]">{item.category.name}</h2>
                    </div>
                    <Button
                      onClick={() => {
                        router.push(`/dashboard/${userType}/orders/${item.id}`);
                      }}
                      className="bg-[gray] hover:bg-[#696767] text-[20px] cursor-pointer"
                    >
                      <BsEye />
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-[10px] justify-between">
                    <div className="flex flex-col gap-y-[14px]">
                      <p>
                        {item.brand} - {item.model}
                      </p>
                      <p className="text-sm">
                        {statusTranslations[item.status] || item.status}
                      </p>
                    </div>
                    <div className="flex flex-col gap-y-[5px] sm:gap-y-[14px]">
                      <p className="text-sm">
                        დაემატა:{" "}
                        {dayjs(item.created_at).format("DD.MM.YYYY - HH:mm:ss")}
                      </p>
                      <p className="text-sm">
                        განახლდა:{" "}
                        {dayjs(item.updated_at).format("DD.MM.YYYY - HH:mm:ss")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
