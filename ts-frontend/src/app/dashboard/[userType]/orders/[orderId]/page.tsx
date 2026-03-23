"use client";

import { Loader2Icon } from "lucide-react";
import dayjs from "dayjs";
import Map from "@/app/components/map/map";
import { useUpdateOrderStore } from "@/app/store/useUpdateOrderStore";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  statusDescriptions,
  typeLabels,
} from "@/app/utils/order-type-status-translations";
import { OrderFlowActions } from "@/app/components/order-flow-actions/order-flow-actions";
import { api } from "@/app/lib/api/axios";
import { useOrderFlowStore } from "@/app/store/useOrderFlowStore";
import { useOrderMediaStore } from "@/app/store/useOrderMediaStore";
import { toast } from "react-toastify";

const fetchUserOrder = async (userType: ClientRole, orderId: string) => {
  const { data } = await api.get(`${userType}/orders/${orderId}`);

  return data;
};

export default function Page() {
  const { userType, orderId } = useParams<{
    userType: ClientRole;
    orderId: string;
  }>();

  const { setLoadingAction } = useOrderFlowStore();

  const { toggleOpenUpdateOrderModal } = useUpdateOrderStore();

  const { openMedia } = useOrderMediaStore();

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

  const getInvoiceLabel = (type: string) => {
    switch (type) {
      case "CREATE_ORDER":
        return "განცხადების შექმნის ინვოისი";
      case "REPAIR_ORDER":
        return "შეკეთების ინვოისი";
      case "SERVICE_ONSITE":
        return "ადგილზე მომსახურების ინვოისი";
      default:
        return `ინვოისი`;
    }
  };

  const downloadInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: "blob",
      });

      // Create temporary link for browser to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },

    onSuccess: () => {
      toast.success("ინვოისი ჩამოიტვირთა");
    },

    onError: (error: any) => {
      toast.error("ინვოისი ვერ ჩამოიტვირთა");
    },
  });

  if (isLoading || isError)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className={`w-full flex flex-col gap-y-4`}>
      {/* Header */}
      <div
        className={`flex items-center ${
          order?.status == "processing" ||
          order?.status == "pending_creation_payment"
            ? "flex-col sm:flex-row gap-2 justify-between"
            : "justify-end"
        }`}
      >
        {(order?.status == "processing" ||
          order?.status == "pending_creation_payment") && (
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

      <OrderFlowActions role={userType} order={order} />

      {order?.invoices?.length > 0 && (
        <>
          <div className="flex flex-col gap-y-2">
            {order.invoices.map((invoice: any) => (
              <div
                key={invoice.id}
                onClick={() => downloadInvoiceMutation.mutate(invoice.id)}
                className={`${
                  downloadInvoiceMutation.isPending &&
                  downloadInvoiceMutation.variables === invoice.id &&
                  "pointer-events-none text-gray-500"
                } self-start flex items-center gap-1`}
              >
                <p className="text-sm underline cursor-pointer">
                  {getInvoiceLabel(invoice.type)}
                </p>
                {downloadInvoiceMutation.isPending &&
                  downloadInvoiceMutation.variables === invoice.id && (
                    <Loader2Icon className="animate-spin w-4 h-4" />
                  )}
              </div>
            ))}
          </div>
          <hr />
        </>
      )}

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
          <p className="text-sm">
            განახლდა:{" "}
            <span className="text-base">
              {dayjs(order?.updated_at).format("DD.MM.YYYY - HH:mm:ss")}
            </span>
          </p>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-[18px]">მისამართი</h3>
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
        <h3 className="mb-1">განაცხადის აღწერა</h3>
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
