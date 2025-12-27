"use client";

import { axiosAdmin } from "@/app/api/axios";
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
import { formatPhone } from "@/app/utils/phone";
import { useOrderTypeStatusOptionsStore } from "@/app/store/orderTypeStatusOptionsStore";
import {
  statusDescriptions,
  typeLabels,
} from "@/app/utils/order-type-status-translations";

const fetchAdminActiveEmployees = async () => {
  const [technicians, deliveries] = await Promise.all([
    axiosAdmin.get("admin/technicians?status=true"),
    axiosAdmin.get("admin/deliveries?status=true"),
  ]);

  return {
    technicians: technicians.data,
    deliveries: deliveries.data,
  };
};

const fetchAdminOrderById = async (orderId: string) => {
  const { data } = await axiosAdmin.get(`admin/orders/${orderId}`);
  return data;
};

export default function Page() {
  const { orderId } = useParams<{
    orderId: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();
  const { statusOptions, typeOptions } = useOrderTypeStatusOptionsStore();

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
    technicianId: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : value
      )
      .required("ტექნიკოსი აუცილებელია"),
    deliveryId: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : value
      )
      .required("კურიერი აუცილებელია"),
    serviceType: Yup.string()
      .oneOf(
        typeOptions.map((o) => o.id),
        "სერვისის ტიპი აუცილებელია"
      )
      .required("აირჩიე სერვისის ტიპი"),
    status: Yup.string().required("სტატუსი აუცილებელია"),
  });

  const updateOrderMutation = useMutation({
    mutationFn: (payload: any) =>
      axiosAdmin.patch(`admin/orders/${orderId}`, payload),

    onSuccess: () => {
      toast.success("შეკვეთა განახლდა", {
        position: "bottom-right",
        autoClose: 3000,
      });

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
      toast.error("ვერ განახლდა", {
        position: "bottom-right",
        autoClose: 3000,
      });
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
          toast.error(e.message, {
            position: "bottom-right",
            autoClose: 3000,
          });
        });
      }
    }
  };

  if (isLoading || isError)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className="border rounded-lg shadow px-[10px] py-[20px] sm:p-[20px] bg-white flex flex-col gap-y-4">
      {/* Header */}
      <h2 className={`flex justify-end text-sm`}>
        {statusDescriptions[order.status] || order.status}
      </h2>

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
              {order.category?.name}
            </span>
          </p>
          <p className="text-sm">
            ბრენდი:{" "}
            <span className="text-base font-semibold">{order.brand}</span>
          </p>
          <p className="text-sm">
            მოდელი:{" "}
            <span className="text-base font-semibold">{order.model}</span>
          </p>
        </div>
        <div>
          <p className="text-sm">
            დაემატა:{" "}
            <span className="text-base font-semibold">
              {dayjs(order.created_at).format("DD.MM.YYYY - HH:mm:ss")}
            </span>
          </p>
          <p className="text-sm">
            განახლდა:{" "}
            <span className="text-base font-semibold">
              {dayjs(order.updated_at).format("DD.MM.YYYY - HH:mm:ss")}
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
          {formatPhone(
            order.individual ? order.individual?.phone : order.company?.phone
          )}
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
        <p>{order.description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
          {/* Videos */}
          {order.videos?.map((videoUrl: string) => (
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              className="h-[80px] sm:h-[130px] w-full object-cover rounded border"
            />
          ))}

          {/* Images */}
          {order.images?.map((imageUrl: string) => (
            <img
              key={imageUrl}
              src={imageUrl}
              alt="Order image"
              className="h-[80px] sm:h-[130px] w-full object-cover rounded border"
            />
          ))}
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
        <Dropdown
          data={employees?.deliveries}
          id="deliveryId"
          value={values.deliveryId}
          label="კურიერი"
          valueKey="id"
          labelKey={(item: any) => `${item.name} ${item.lastName}`}
          onChange={handleChange}
          error={errors.deliveryId}
        />
        <Dropdown
          data={employees?.technicians}
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
    </div>
  );
}
