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

  const [values, setValues] = useState({
    technicianId: "",
    status: "",
  });

  const [errors, setErrors] = useState({
    technicianId: "",
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

  // update order

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { id: string; value: string } }
  ) => {
    const { id, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [id]: id === "technicianId" ? Number(value) : value,
    }));
  };

  const updateOrderSchema = Yup.object().shape({
    technicianId: Yup.number().required("ტექნიკოსი აუცილებელია"),
    status: Yup.string().required("სტატუსი აუცილებელია"),
  });

  const handleAdminUpdateOrder = async () => {
    setLoading(true);
    try {
      // Yup validation
      setErrors({
        technicianId: "",
        status: "",
      });
      await updateOrderSchema.validate(values, { abortEarly: false });

      let payload: any = {
        technicianId: values.technicianId,
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

          {/* User */}
          <div>
            <h3>
              {order.individual ? "ინდივიდუალური მომხმარებელი" : "კომპანია"}
            </h3>
            <p>
              {order.individual
                ? order.individual?.name + " " + order.individual?.lastName
                : order.company &&
                  order.company?.companyName +
                    " | საიდენტიფიკაციო კოდი: " +
                    order.company?.companyIdentificationCode}
            </p>
            {order.company && (
              <p>
                {order.company?.companyAgentName +
                  " " +
                  order.company?.companyAgentLastName}
              </p>
            )}
            <p>
              {order.individual
                ? order.individual?.phone
                : order.company?.phone}
            </p>
          </div>

          {/* Address */}
          <div className="flex flex-col">
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
            <h3 className="font-semibold mb-1">შეკვეთის აღწერა</h3>
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
            {loading && <Loader2Icon className="animate-spin" />}ცვლილებების
            შენახვა
          </Button>
        </>
      )}
    </div>
  );
}
