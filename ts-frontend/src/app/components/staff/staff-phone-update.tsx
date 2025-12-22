"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { toast } from "react-toastify";
import { axiosDelivery, axiosTechnician } from "@/app/api/axios";
import { sendCodeSchema, verifyCodeSchema } from "@/app/utils/validation";
import { useParams } from "next/navigation";
import PanelFormInput from "../inputs/panel-form-input";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/app/utils/phone";

export default function StaffPhoneUpdate() {
  const { currentUser } = useAuthStore();
  const { staffType } = useParams<{ staffType: "technician" | "delivery" }>();

  const [values, setValues] = useState({
    phone: "",
    code: "",
  });

  useEffect(() => {
    if (currentUser) {
      setValues((prev) => ({
        ...prev,
        phone: formatPhone(currentUser.phone) || "",
      }));
    }
  }, [currentUser]);

  const [errors, setErrors] = useState({
    phone: "",
    code: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [id]: id === "phone" ? formatPhone(value) : value,
    }));
  };

  // phone update

  const [sentChangeNumberCode, setSentChangeNumberCode] = useState("");

  const api = staffType === "technician" ? axiosTechnician : axiosDelivery;

  const handleSendStaffNumberCode = async () => {
    setLoading(true);
    try {
      // Yup validation
      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));

      await sendCodeSchema.validate(values, {
        abortEarly: false,
      });

      api
        .post(`${staffType}/send-change-number-code`, {
          phone: values.phone && values.phone.replace(/\s+/g, ""),
        })
        .then((res) => {
          setSentChangeNumberCode(res.data.code);
          toast.success(`კოდი გამოიგზავნა`, {
            position: "bottom-right",
            autoClose: 3000,
          });
        })
        .catch((error) => {
          setErrors((prev) => ({
            ...prev,
            phone: "შეცდომა",
          }));

          if (error.response.data.message === "Phone already used") {
            toast.error("ტელეფონის ნომერი გამოყენებულია", {
              position: "bottom-right",
              autoClose: 3000,
            });
          } else {
            toast.error("კოდი ვერ გამოიგზავნა", {
              position: "bottom-right",
              autoClose: 3000,
            });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err: any) {
      // Yup validation errors
      if (err.inner) {
        const newErrors: any = {};
        err.inner.forEach((e: any) => {
          if (e.path) {
            newErrors[e.path] = e.message;
            toast.error(e.message, {
              position: "bottom-right",
              autoClose: 3000,
            });
          }
        });
        setErrors(newErrors);
      }
      setLoading(false);
    }
  };

  const handleChangeStaffNumber = async () => {
    setLoading(true);
    try {
      // Yup validation
      setErrors((prev) => ({
        ...prev,
        phone: "",
        code: "",
      }));

      await verifyCodeSchema.validate(values, {
        abortEarly: false,
      });

      api
        .post(`${staffType}/change-number`, {
          phone: values.phone && values.phone.replace(/\s+/g, ""),
          code: values.code,
        })
        .then((res) => {
          setSentChangeNumberCode("");
          setValues((prev) => ({
            ...prev,
            code: "",
          }));
          toast.success(`ტელეფონის ნომერი განახლდა`, {
            position: "bottom-right",
            autoClose: 3000,
          });
        })
        .catch((error) => {
          setErrors((prev) => ({
            ...prev,
            code: "შეცდომა",
          }));

          toast.error("ტელეფონის ნომერი ვერ განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err: any) {
      // Yup validation errors
      if (err.inner) {
        const newErrors: any = {};
        err.inner.forEach((e: any) => {
          if (e.path) {
            newErrors[e.path] = e.message;
            toast.error(e.message, {
              position: "bottom-right",
              autoClose: 3000,
            });
          }
        });
        setErrors(newErrors);
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-[20px] w-full">
      <div className="flex flex-col gap-y-[10px] w-full">
        <h2>
          {staffType == "technician" ? "ტექნიკოსის" : "კურიერის"} ტელეფონის
          ნომერი
        </h2>
        <p className="text-center text-sm">
          {sentChangeNumberCode
            ? "შეიყვანე ტელეფონის ნომერზე გამოგზავნილი კოდი"
            : "თუ გსურს ტელეფონის ნომრის განახლება საჭიროა ახალი ნომრის დადასტურება ვალიდური კოდით"}
        </p>

        {/* For debug, can remove */}
        {sentChangeNumberCode && <p>{sentChangeNumberCode}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
          {sentChangeNumberCode ? (
            <PanelFormInput
              id="code"
              value={values.code}
              onChange={handleChange}
              label="კოდი"
              error={errors.code}
            />
          ) : (
            <PanelFormInput
              id="phone"
              value={values.phone}
              onChange={handleChange}
              label="ტელეფონის ნომერი"
              error={errors.phone}
            />
          )}
        </div>
      </div>
      <Button
        onClick={
          sentChangeNumberCode
            ? handleChangeStaffNumber
            : handleSendStaffNumberCode
        }
        disabled={loading}
        className="h-11 cursor-pointer self-end"
      >
        {loading && <Loader2Icon className="animate-spin" />}
        {sentChangeNumberCode ? "შემოწმება" : "კოდის გაგზავნა"}
      </Button>
    </div>
  );
}
