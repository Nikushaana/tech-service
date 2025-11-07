"use client";

import { axiosDelivery, axiosTechnician } from "@/app/api/axios";
import { statusTranslations } from "@/app/utils/status-translations";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Map from "@/app/components/map/map";
import { useParams } from "next/navigation";

export default function Page() {
  const { staffType, orderId } = useParams<{
    staffType: "technician" | "delivery";
    orderId: string;
  }>();

  const [order, setOrder] = useState<Order>();
  const [loading, setLoading] = useState<boolean>(true);

  const api = staffType === "technician" ? axiosTechnician : axiosDelivery;

  useEffect(() => {
    setLoading(true);

    api
      .get(`${staffType}/orders/${orderId}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [staffType, orderId]);

  if (loading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div
      className={`border rounded-lg shadow px-[10px] py-[20px] sm:p-[20px] bg-white w-full max-w-3xl mx-auto flex flex-col gap-y-4 `}
    >
      {/* Header */}
      <h2 className="flex justify-end text-sm">
        {(order && statusTranslations[order.status]) || order?.status}
      </h2>

      {/* Main Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm">
            სერვისის ტიპი:{" "}
            <span className="text-base font-semibold">
              {order?.service_type}
            </span>
          </p>
          <p className="text-sm">
            კატეგორია:{" "}
            <span className="text-base font-semibold">
              {order?.category?.name}
            </span>
          </p>
          <p className="text-sm">
            ბრენდი:{" "}
            <span className="text-base font-semibold">{order?.brand}</span>
          </p>
          <p className="text-sm">
            მოდელი:{" "}
            <span className="text-base font-semibold">{order?.model}</span>
          </p>
        </div>
        <div>
          <p className="text-sm">
            დაემატა:{" "}
            <span className="text-base font-semibold">
              {dayjs(order?.created_at).format("DD.MM.YYYY - HH:mm:ss")}
            </span>
          </p>
          <p className="text-sm">
            განახლდა:{" "}
            <span className="text-base font-semibold">
              {dayjs(order?.updated_at).format("DD.MM.YYYY - HH:mm:ss")}
            </span>
          </p>
        </div>
      </div>

      {/* User */}
      <div>
        <h3>{order?.individual ? "ინდივიდუალური მომხმარებელი" : "კომპანია"}</h3>
        <p>
          {order?.individual
            ? order.individual?.name + " " + order.individual?.lastName
            : order?.company && order.company?.companyName}
        </p>

        {order?.company && (
          <>
            <p className="text-sm">
              საიდენტიფიკაციო კოდი:{" "}
              <span className="text-base font-semibold">
                {order.company?.companyIdentificationCode}
              </span>
            </p>
            <p>
              {order.company?.companyAgentName +
                " " +
                order.company?.companyAgentLastName}
            </p>
          </>
        )}
        <p>
          {order?.individual ? order.individual?.phone : order?.company?.phone}
        </p>
      </div>

      {/* Address */}
      <div className="flex flex-col">
        <h3>მისამართი</h3>
        <p>{order?.address?.name}</p>
        <p className="text-sm">
          ქალაქი:{" "}
          <span className="text-base font-semibold">
            {order?.address?.city}
          </span>
        </p>
        <p className="text-sm">
          ქუჩა:{" "}
          <span className="text-base font-semibold">
            {order?.address?.street}
          </span>
        </p>
        <p className="text-sm">
          შენობის ნომერი:{" "}
          <span className="text-base font-semibold">
            {order?.address?.building_number}
          </span>
        </p>
        {order?.address?.building_entrance && (
          <p className="text-sm">
            სადარბაზო:{" "}
            <span className="text-base font-semibold">
              {order?.address?.building_entrance}
            </span>
          </p>
        )}
        {order?.address?.building_floor && (
          <p className="text-sm">
            სართული:{" "}
            <span className="text-base font-semibold">
              {order?.address?.building_floor}
            </span>
          </p>
        )}
        {order?.address?.apartment_number && (
          <p className="text-sm">
            ბინის ნომერი:{" "}
            <span className="text-base font-semibold">
              {order?.address?.apartment_number}
            </span>
          </p>
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
        <p
          onClick={() =>
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${order?.address?.location?.lat},${order?.address?.location?.lng}`,
              "_blank"
            )
          }
          className="underline text-sm hover:text-myGray mt-2 self-end cursor-pointer"
        >
          რუკაზე ნახვა
        </p>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold mb-1">სერვისის აღწერა</h3>
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
    </div>
  );
}
