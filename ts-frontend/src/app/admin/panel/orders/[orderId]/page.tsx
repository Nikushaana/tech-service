"use client";

import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Dropdown } from "@/app/components/inputs/drop-down";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Map from "@/app/components/map/map";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatPhone } from "@/app/utils/formatPhone";
import { useOrderTypeStatusOptionsStore } from "@/app/store/orderTypeStatusOptionsStore";
import {
  statusDescriptions,
  typeLabels,
} from "@/app/utils/order-type-status-translations";
import { api } from "@/app/lib/api/axios";
import { useOrderMediaStore } from "@/app/store/useOrderMediaStore";

const fetchAdminActiveEmployees = async () => {
  const [technicians, deliveries] = await Promise.all([
    api.get("admin/technicians?status=true"),
    api.get("admin/deliveries?status=true"),
  ]);

  return {
    technicians: technicians.data,
    deliveries: deliveries.data,
  };
};

const fetchAdminOrderById = async (orderId: string) => {
  const { data } = await api.get(`admin/orders/${orderId}`);
  return data;
};

export default function Page() {
  const { orderId } = useParams<{
    orderId: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();
  const { statusOptions, typeOptions } = useOrderTypeStatusOptionsStore();

  const { openMedia } = useOrderMediaStore();

  const { data: employees } = useQuery({
    queryKey: ["adminActiveEmployees"],
    queryFn: fetchAdminActiveEmployees,
  });

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["adminOrder", orderId],
    queryFn: () => fetchAdminOrderById(orderId),
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      router.back();
    }
  }, [isError, router]);

  const [values, setValues] = useState({
    technicianId: "",
    deliveryId: "",
    serviceType: "",
    status: "",
  });

  const [errors, setErrors] = useState({
    technicianId: "",
    deliveryId: "",
    serviceType: "",
    status: "",
  });

  useEffect(() => {
    if (order) {
      setValues({
        technicianId: order.technician?.id || "",
        deliveryId: order.delivery?.id || "",
        serviceType: order.service_type || "",
        status: order.status || "",
      });
    }
  }, [order]);

  const handleChange = (e: { target: { id: string; value: string } }) => {
    const { id, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // update order
  const updateOrderSchema = Yup.object().shape({
    serviceType: Yup.string()
      .oneOf(
        typeOptions.map((o) => o.id),
        "სერვისის ტიპი აუცილებელია",
      )
      .required("აირჩიე სერვისის ტიპი"),
    technicianId: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : value,
      )
      .required("ტექნიკოსი აუცილებელია"),
    deliveryId: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : value,
      )
      .when("serviceType", {
        is: "fix_off_site",
        then: (schema) => schema.required("კურიერი აუცილებელია"),
        otherwise: (schema) => schema.notRequired(),
      }),
    status: Yup.string()
      .required("სტატუსი აუცილებელია")
      .test(
        "status-changed",
        "აირჩიე განსხვავებული სტატუსი",
        (value) => value !== order.status,
      ),
  });

  const updateOrderMutation = useMutation({
    mutationFn: (payload: any) => api.patch(`admin/orders/${orderId}`, payload),

    onSuccess: () => {
      toast.success("შეკვეთა განახლდა");

      // refetch order data
      queryClient.invalidateQueries({
        queryKey: ["adminOrder", orderId],
      });
      // refresh orders list
      queryClient.invalidateQueries({
        queryKey: ["adminOrders"],
      });
    },

    onError: () => {
      toast.error("ვერ განახლდა");
    },
  });

  const handleAdminUpdateOrder = async () => {
    try {
      setErrors({
        technicianId: "",
        deliveryId: "",
        serviceType: "",
        status: "",
      });

      await updateOrderSchema.validate(values, { abortEarly: false });

      updateOrderMutation.mutate({
        technicianId: Number(values.technicianId),
        deliveryId: Number(values.deliveryId),
        service_type: values.serviceType,
        status: values.status,
      });
    } catch (err: any) {
      if (err.inner) {
        err.inner.forEach((e: any) => {
          setErrors((prev) => ({
            ...prev,
            [e.path]: e.message,
          }));
          toast.error(e.message);
        });
      }
    }
  };

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
    <div className="flex flex-col gap-y-4">
      {/* Header */}
      <h2 className={`flex justify-end text-sm`}>
        {statusDescriptions[order.status] || order.status}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
        <Dropdown
          data={employees?.deliveries?.data}
          id="deliveryId"
          value={values.deliveryId}
          label="კურიერი"
          valueKey="id"
          labelKey={(item: any) => `${item.name} ${item.lastName}`}
          onChange={handleChange}
          error={errors.deliveryId}
        />
        <Dropdown
          data={employees?.technicians?.data}
          id="technicianId"
          value={values.technicianId}
          label="ტექნიკოსი"
          valueKey="id"
          labelKey={(item: any) => `${item.name} ${item.lastName}`}
          onChange={handleChange}
          error={errors.technicianId}
        />
        <Dropdown
          data={typeOptions}
          id="serviceType"
          value={values.serviceType}
          label="სერვისის ტიპი"
          valueKey="id"
          labelKey="name"
          onChange={handleChange}
          error={errors.serviceType}
        />
        <Dropdown
          data={statusOptions}
          id="status"
          value={values.status}
          label="სტატუსი"
          valueKey="id"
          labelKey="name"
          onChange={handleChange}
          error={errors.status}
        />
      </div>

      <Button
        onClick={handleAdminUpdateOrder}
        disabled={updateOrderMutation.isPending}
        className="h-11 cursor-pointer self-end"
      >
        {updateOrderMutation.isPending && (
          <Loader2Icon className="animate-spin" />
        )}
        ცვლილებების შენახვა
      </Button>
      <hr />

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
            კატეგორია: <span className="text-base">{order.category?.name}</span>
          </p>
          <p className="text-sm">
            ბრენდი: <span className="text-base">{order.brand}</span>
          </p>
          <p className="text-sm">
            მოდელი: <span className="text-base">{order.model}</span>
          </p>
        </div>
        <div>
          <p className="text-sm">
            დაემატა:{" "}
            <span className="text-base">
              {dayjs(order.created_at).format("DD.MM.YYYY - HH:mm:ss")}
            </span>
          </p>
        </div>
      </div>

      {/* User */}
      <div>
        <h3>{order.individual ? "ფიზიკური პირი" : "იურიდიული პირი"}</h3>
        <p>
          {order.individual
            ? order.individual?.name + " " + order.individual?.lastName
            : order.company && order.company?.companyName}
        </p>

        {order.company && (
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
            order.individual ? order.individual?.phone : order.company?.phone,
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
        <p>{order.description}</p>
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
