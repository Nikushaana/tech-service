"use client";

import { axiosAdmin } from "@/app/api/axios";
import { Button } from "@/app/components/ui/button";
import { statusTranslations } from "@/app/utils/status-translations";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BsEye, BsPen } from "react-icons/bs";

export default function Page() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    setLoading(true);
    axiosAdmin
      .get("/admin/orders")
      .then(({ data }) => setOrders(data))
      .catch((err) => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  return (
    <div className="flex flex-col items-center gap-y-[20px] w-full">
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-white w-full border border-gray-200 shadow-sm hover:shadow-lg transition-transform duration-200 transform hover:-translate-y-1 rounded-xl p-[14px] flex flex-col gap-[10px]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[20px]">{order.category.name}</h2>
              <Button
                onClick={() => {
                  router.push(`/admin/panel/orders/${order.id}`);
                }}
                className="bg-[gray] hover:bg-[#696767] text-[20px] p-0! w-[40px] h-[40px] cursor-pointer"
              >
                <BsEye />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-[10px] justify-between">
              <div className="flex flex-col gap-y-[14px]">
                <p>
                  {order.brand} - {order.model}
                </p>
                <p className="text-sm">
                  {statusTranslations[order.status] || order.status}
                </p>
              </div>
              <div className="flex flex-col gap-y-[5px] sm:gap-y-[14px]">
                <p className="text-sm">
                  დაემატა:{" "}
                  {dayjs(order.created_at).format("DD.MM.YYYY - HH:mm:ss")}
                </p>
                <p className="text-sm">
                  განახლდა:{" "}
                  {dayjs(order.updated_at).format("DD.MM.YYYY - HH:mm:ss")}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
