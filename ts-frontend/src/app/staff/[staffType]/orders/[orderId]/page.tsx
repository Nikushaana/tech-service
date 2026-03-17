"use client";

import { Loader2Icon } from "lucide-react";
import dayjs from "dayjs";
import Map from "@/app/components/map/map";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { formatPhone } from "@/app/utils/formatPhone";
import { useEffect } from "react";
import {
  statusDescriptions,
  typeLabels,
} from "@/app/utils/order-type-status-translations";
import { OrderFlowActions } from "@/app/components/order-flow-actions/order-flow-actions";
import { api } from "@/app/lib/api/axios";
import { useOrderFlowStore } from "@/app/store/useOrderFlowStore";
import { useOrderMediaStore } from "@/app/store/useOrderMediaStore";

const fetchStaffOrder = async (staffType: StaffRole, orderId: string) => {
  const { data } = await api.get(`${staffType}/orders/${orderId}`);
  return data;
};

export default function Page() {
  const { staffType, orderId } = useParams<{
    staffType: StaffRole;
    orderId: string;
  }>();

  const { setLoadingAction } = useOrderFlowStore();

  const { openMedia } = useOrderMediaStore();

  const router = useRouter();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["staffOrder", staffType, orderId],
    queryFn: () => fetchStaffOrder(staffType, orderId),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  useEffect(() => {
    if (order) {
      setLoadingAction(null);
    }
  }, [order, setLoadingAction]);

  useEffect(() => {
    if (isError) {
      router.back();
    }
  }, [isError, router]);

  const orderMedia = [
    ...(order?.images || []).map((url: string) => ({
      url,
      type: "image",
    })),
    ...(order?.videos || []).map((url: string) => ({
      url,
      type: "video",
    })),
  ];

  if (isLoading || isError)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className={`w-full flex flex-col gap-y-4 `}>
      {/* Header */}
      <h2 className="flex justify-end text-sm text-center">
        {(order && statusDescriptions[order.status]) || order?.status}
      </h2>

      {/* Service Details */}
      {(order.payment_reason ||
        Number(order.payment_amount) > 0 ||
        order.cancel_reason) && (
        <>
          <div>
            <h3 className="mb-2">სერვისის დეტალები</h3>

            {order.payment_reason && (
              <p className="text-sm">
                დანიშნულება:{" "}
                <span className="text-base">{order.payment_reason}</span>
              </p>
            )}

            {order.payment_amount && (
              <p className="text-sm">
                ფასი:{" "}
                <span className="text-base">{order.payment_amount} ₾</span>
              </p>
            )}

            {order.cancel_reason && (
              <p className="text-sm text-red-600">
                გაუქმების მიზეზი:{" "}
                <span className="text-base">{order.cancel_reason}</span>
              </p>
            )}
          </div>
          <hr />
        </>
      )}

      <OrderFlowActions role={staffType} order={order} />

      {/* Main Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm">
            სერვისის ტიპი:{" "}
            <span className="text-base">
              {typeLabels[order.service_type] || order.service_type}
            </span>
          </p>
          <p className="text-sm">
            კატეგორია:{" "}
            <span className="text-base">{order?.category?.name}</span>
          </p>
          <p className="text-sm">
            ბრენდი: <span className="text-base">{order?.brand}</span>
          </p>
          <p className="text-sm">
            მოდელი: <span className="text-base">{order?.model}</span>
          </p>
        </div>
        <div>
          <p className="text-sm">
            დაემატა:{" "}
            <span className="text-base">
              {dayjs(order?.created_at).format("DD.MM.YYYY - HH:mm:ss")}
            </span>
          </p>
        </div>
      </div>

      {/* User */}
      <div>
        <h3>{order?.individual ? "ფიზიკური პირი" : "იურიდიული პირი"}</h3>
        <p>
          {order?.individual
            ? order.individual?.name + " " + order.individual?.lastName
            : order?.company && order.company?.companyName}
        </p>

        {order?.company && (
          <>
            <p className="text-sm">
              საიდენტიფიკაციო კოდი:{" "}
              <span className="text-base">
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
          {formatPhone(
            order?.individual ? order.individual?.phone : order?.company?.phone,
          )}
        </p>
      </div>

      {/* Address */}
      <div className="flex flex-col">
        <h3>მისამართი</h3>
        <p>{order?.address?.name}</p>
        <p className="text-sm">
          ქუჩა: <span className="text-base">{order?.address?.street}</span>
        </p>
        <p className="text-sm">
          შენობის ნომერი:{" "}
          <span className="text-base">{order?.address?.building_number}</span>
        </p>
        <p className="text-sm">
          დამატებითი ინფორმაცია:{" "}
          <span className="text-base">{order?.address?.description}</span>
        </p>

        <div className="h-[200px] mt-2">
          <Map
            centerCoordinates={order?.address.location}
            markerCoordinates={order?.address.location}
            seeGoogleMap={true}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="mb-1">სერვისის აღწერა</h3>
        <p>{order?.description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
          {/* order media */}
          {orderMedia.map((item, index) =>
            item.type === "image" ? (
              <img
                key={item.url}
                src={item.url}
                onClick={() => openMedia(orderMedia, index)}
                className="h-[80px] sm:h-[130px] w-full object-cover rounded-lg border cursor-pointer"
              />
            ) : (
              <video
                key={item.url}
                src={item.url}
                onClick={() => openMedia(orderMedia, index)}
                className="h-[80px] sm:h-[130px] w-full object-cover rounded-lg border cursor-pointer"
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
