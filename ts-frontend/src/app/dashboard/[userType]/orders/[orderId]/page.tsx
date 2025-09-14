"use client";

import { axiosCompany, axiosIndividual } from "@/app/api/axios";
import { statusTranslations } from "@/app/utils/status-translations";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

interface OrderPageProps {
  params: Promise<{
    userType: "company" | "individual";
    orderId: string;
  }>;
}

export default function Page({ params }: OrderPageProps) {
  const resolvedParams = React.use(params);
  const { userType, orderId } = resolvedParams;

  const [order, setOrder] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const axiosInstance =
      userType === "individual" ? axiosIndividual : axiosCompany;

    setLoading(true);

    axiosInstance
      .get(`${userType}/orders/${orderId}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [userType, orderId]);

  return (
    <div
      className={`border rounded-lg shadow px-[10px] py-[20px] sm:p-[20px] bg-white w-full max-w-3xl mx-auto flex flex-col gap-y-4 ${
        loading && "flex items-center justify-center"
      }`}
    >
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <>
          {/* Header */}
          <h2 className={`flex justify-end text-sm`}>
            {statusTranslations[order.status] || order.status}
          </h2>

          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p>კატეგორია: {order.category?.name}</p>
              <p>ბრენდი: {order.brand}</p>
              <p>მოდელი: {order.model}</p>
            </div>
            <div>
              <p>
                დაემატა:{" "}
                {dayjs(order.created_at).format("DD.MM.YYYY - HH:mm:ss")}
              </p>
              <p>
                განახლდა:{" "}
                {dayjs(order.updated_at).format("DD.MM.YYYY - HH:mm:ss")}
              </p>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3>მისამართი</h3>
            <p>{order.address?.name}</p>
            <p>{order.address?.description}</p>
            <p>
              {order.address?.street}, {"N" + order.address?.building_number}
              {order.address?.building_entrance &&
                `, შესასვლელი: ${order.address?.building_entrance}`}
              {order.address?.building_floor &&
                `, სართული: ${order.address?.building_floor}`}
              {order.address?.apartment_number &&
                `, ბინის ნომერი: ${order.address?.apartment_number}`}
              , {order.address?.city}
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-1">შეკვეთის აღწერა</h3>
            <p>{order.description}</p>
            <div className="flex flex-wrap gap-4 mt-2">
              {/* Videos */}
              {order.videos?.map((videoUrl: string) => (
                <video
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  className="w-[200px] h-[130px] object-contain rounded border"
                />
              ))}

              {/* Images */}
              {order.images?.map((imageUrl: string) => (
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt="Order image"
                  className="w-[200px] h-[130px] object-contain rounded border"
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
