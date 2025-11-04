"use client";

import { axiosAdmin } from "@/app/api/axios";
import { statusTranslations } from "@/app/utils/status-translations";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Dropdown } from "@/app/components/inputs/drop-down";
import * as Yup from "yup";
import { Button } from "@/app/components/ui/button";
import { toast } from "react-toastify";
import { useOrderStatusOptionsStore } from "@/app/store/orderStatusOptionsStore";
import Map from "@/app/components/map/map";

interface OrderPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function Page({ params }: OrderPageProps) {
  const resolvedParams = React.use(params);
  const { orderId } = resolvedParams;

  const { statusOptions } = useOrderStatusOptionsStore();

  const [order, setOrder] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  const [technicians, setTechnicians] = useState<User[]>([]);
  const [deliveries, setDeliveries] = useState<User[]>([]);

  const [values, setValues] = useState({
    technicianId: "",
    deliveryId: "",
    status: "",
  });

  const [errors, setErrors] = useState({
    technicianId: "",
    deliveryId: "",
    status: "",
  });

  // fetch order
  const fetchOrder = () => {
    setLoading(true);

    axiosAdmin
      .get(`admin/orders/${orderId}`)
      .then((res) => {
        setOrder(res.data);
        setValues({
          technicianId: res.data.technician?.id || "",
          deliveryId: res.data.delivery?.id || "",
          status: res.data.status || "",
        });
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // fetch technicians
  const fetchTechnicians = () => {
    axiosAdmin
      .get("/admin/technicians?status=true")
      .then(({ data }) => setTechnicians(data))
      .catch((err) => {})
      .finally(() => {});
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  // fetch deliveries
  const fetchDeliveries = () => {
    axiosAdmin
      .get("/admin/deliveries?status=true")
      .then(({ data }) => setDeliveries(data))
      .catch((err) => {})
      .finally(() => {});
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // update order

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { id: string; value: string } }
  ) => {
    const { id, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [id]:
        id === "technicianId" || id === "deliveryId" ? Number(value) : value,
    }));
  };

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
    status: Yup.string().required("სტატუსი აუცილებელია"),
  });

  const handleAdminUpdateOrder = async () => {
    setLoading(true);
    try {
      // Yup validation
      setErrors({
        technicianId: "",
        deliveryId: "",
        status: "",
      });
      await updateOrderSchema.validate(values, { abortEarly: false });

      let payload: any = {
        technicianId: values.technicianId,
        deliveryId: values.deliveryId,
        status: values.status,
      };

      axiosAdmin
        .patch(`admin/orders/${orderId}`, payload)
        .then((res) => {
          toast.success(`შეკვეთა განახლდა`, {
            position: "bottom-right",
            autoClose: 3000,
          });

          fetchOrder();

          setErrors({
            technicianId: "",
            deliveryId: "",
            status: "",
          });
        })
        .catch((error) => {
          toast.error("ვერ განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          setErrors({
            technicianId: "შეცდომა",
            deliveryId: "შეცდომა",
            status: "შეცდომა",
          });

          setLoading(false);
        })
        .finally(() => {});
    } catch (err: any) {
      // Yup validation errors
      if (err.inner) {
        err.inner.forEach((e: any) => {
          if (e.path) {
            setErrors((prev) => ({
              ...prev,
              [e.path]: e.message,
            }));
            toast.error(e.message, {
              position: "bottom-right",
              autoClose: 3000,
            });
          }
        });
      }
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div
      className={`border rounded-lg shadow px-[10px] py-[20px] sm:p-[20px] bg-white w-full max-w-3xl mx-auto flex flex-col gap-y-4`}
    >
      {/* Header */}
      <h2 className={`flex justify-end text-sm`}>
        {statusTranslations[order.status] || order.status}
      </h2>

      {/* Main Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm">
            სერვისის ტიპი:{" "}
            <span className="text-base font-semibold">
              {order.service_type}
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
        <h3>{order.individual ? "ინდივიდუალური მომხმარებელი" : "კომპანია"}</h3>
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
          {order.individual ? order.individual?.phone : order.company?.phone}
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

      <div className="flex flex-col sm:flex-row gap-[10px]">
        <Dropdown
          data={deliveries}
          id="deliveryId"
          value={order.delivery?.id || ""}
          onChange={handleChange}
          label="კურიერი"
          error={errors.deliveryId}
        />
        <Dropdown
          data={technicians}
          id="technicianId"
          value={order.technician?.id || ""}
          onChange={handleChange}
          label="ტექნიკოსი"
          error={errors.technicianId}
        />
        <Dropdown
          data={statusOptions}
          id="status"
          value={order.status || ""}
          onChange={handleChange}
          label="სტატუსი"
          error={errors.status}
        />
      </div>

      <Button
        onClick={() => {
          handleAdminUpdateOrder();
        }}
        disabled={loading}
        className="h-11 cursor-pointer self-end"
      >
        ცვლილებების შენახვა
      </Button>
    </div>
  );
}
