"use client";

import { Loader2Icon } from "lucide-react";
import dayjs from "dayjs";
import Map from "@/app/components/map/map";
import { useUpdateOrderStore } from "@/app/store/useUpdateOrderStore";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  statusDescriptions,
  typeLabels,
} from "@/app/utils/order-type-status-translations";
import { OrderFlowActions } from "@/app/components/order-flow-actions/order-flow-actions";
import { axiosCompany, axiosIndividual } from "@/app/lib/api/axios";

const fetchUserOrder = async (userType: ClientRole, orderId: string) => {
  const api = userType === "company" ? axiosCompany : axiosIndividual;
  const { data } = await api.get(`${userType}/orders/${orderId}`);
  return data;
};

export default function Page() {
  const { userType, orderId } = useParams<{
    userType: ClientRole;
    orderId: string;
  }>();

  const { toggleOpenUpdateOrderModal } = useUpdateOrderStore();

  const router = useRouter();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userOrder", userType, orderId],
    queryFn: () => fetchUserOrder(userType, orderId),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      router.back();
    }
  }, [isError, router]);

  if (isLoading || isError)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div
      className={`border rounded-lg shadow px-[10px] py-[20px] sm:p-[20px] bg-white w-full flex flex-col gap-y-4 `}
    >
      {/* Header */}
      <div
        className={`flex items-center ${
          order?.status == "pending" || order?.status == "waiting_pre_payment"
            ? "flex-col sm:flex-row gap-2 justify-between"
            : "justify-end"
        }`}
      >
        {(order?.status == "pending" ||
          order?.status == "waiting_pre_payment") && (
          <p
            onClick={() => {
              toggleOpenUpdateOrderModal(userType, order);
            }}
            className="cursor-pointer text-[12px] hover:underline underline md:no-underline"
          >
            ინფორმაციის ცვლილება
          </p>
        )}
        <h2 className="text-sm text-center">
          {(order && statusDescriptions[order.status]) || order?.status}
        </h2>
      </div>

      {/* Service Details */}
      {(order.payment_reason ||
        Number(order.payment_amount) > 0 ||
        order.cancel_reason) && (
        <>
          <div>
            <h3 className="font-semibold mb-2">სერვისის დეტალები</h3>

            {order.payment_reason && (
              <p className="text-sm">
                დანიშნულება:{" "}
                <span className="text-base font-semibold">
                  {order.payment_reason}
                </span>
              </p>
            )}

            {order.payment_amount && (
              <p className="text-sm">
                ფასი:{" "}
                <span className="text-base font-semibold">
                  {order.payment_amount} ₾
                </span>
              </p>
            )}

            {order.cancel_reason && (
              <p className="text-sm text-red-600">
                გაუქმების მიზეზი:{" "}
                <span className="text-base font-semibold">
                  {order.cancel_reason}
                </span>
              </p>
            )}
          </div>
          <hr />
        </>
      )}

      <OrderFlowActions role={userType} order={order} />

      {/* Main Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm">
            სერვისის ტიპი:{" "}
            <span className="text-base font-semibold">
              {typeLabels[order.service_type] || order.service_type}
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

      {/* Address */}
      <div>
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
