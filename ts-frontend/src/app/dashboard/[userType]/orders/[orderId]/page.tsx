"use client";

import { axiosCompany, axiosIndividual } from "@/app/api/axios";
import { statusTranslations } from "@/app/utils/status-translations";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Map from "@/app/components/map/map";

interface OrderPageProps {
  params: Promise<{
    userType: "company" | "individual";
    orderId: string;
  }>;
}

export default function Page({ params }: OrderPageProps) {
  const resolvedParams = React.use(params);
  const { userType, orderId } = resolvedParams;

  const [order, setOrder] = useState<Order>();
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
            {(order && statusTranslations[order.status]) || order?.status}
          </h2>

          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p>კატეგორია: {order?.category?.name}</p>
              <p>ბრენდი: {order?.brand}</p>
              <p>მოდელი: {order?.model}</p>
            </div>
            <div>
              <p>
                დაემატა:{" "}
                {dayjs(order?.created_at).format("DD.MM.YYYY - HH:mm:ss")}
              </p>
              <p>
                განახლდა:{" "}
                {dayjs(order?.updated_at).format("DD.MM.YYYY - HH:mm:ss")}
              </p>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3>მისამართი</h3>
            <p>{order?.address?.name}</p>
            <p>ქალაქი: {order?.address?.city}</p>
            <p>ქუჩა: {order?.address?.street}</p>
            <p>შენობის ნომერი: {order?.address?.building_number}</p>
            {order?.address?.building_entrance && (
              <p>სადარბაზო: {order?.address?.building_entrance}</p>
            )}
            {order?.address?.building_floor && (
              <p>სართული: {order?.address?.building_floor}</p>
            )}
            {order?.address?.apartment_number && (
              <p>ბინის ნომერი: {order?.address?.apartment_number}</p>
            )}
            <p className="p-[5px] bg-gray-100 rounded-[8px]">
              {order?.address?.description}
            </p>
            <div className="h-[100px] mt-2 bg-myLightBlue rounded-[8px] overflow-hidden">
              <Map
                centerCoordinates={order?.address.location}
                markerCoordinates={order?.address.location}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-1">შეკვეთის აღწერა</h3>
            <p>{order?.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
              {/* Videos */}
              {order?.videos?.map((videoUrl: string) => (
                <video
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  className="h-[80px] sm:h-[130px] w-full object-cover rounded border"
                />
              ))}

              {/* Images */}
              {order?.images?.map((imageUrl: string) => (
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt="Order image"
                  className="h-[80px] sm:h-[130px] w-full object-cover rounded border"
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
