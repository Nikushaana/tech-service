"use client";

import { axiosAdmin } from "@/app/api/axios";
import { statusTranslations } from "@/app/utils/status-translations";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Dropdown } from "@/app/components/inputs/drop-down-menu";
import * as Yup from "yup";
import { Button } from "@/app/components/ui/button";
import { toast } from "react-toastify";
import { useOrderStatusOptionsStore } from "@/app/store/orderStatusOptionsStore";

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
                    " | საიდენტიფიკაციო კოდი:" +
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
