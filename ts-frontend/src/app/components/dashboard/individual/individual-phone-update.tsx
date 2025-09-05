"use client";

import React, { useEffect, useState } from "react";
import PanelFormInput from "../../inputs/panel-form-input";
import { Button } from "../../ui/button";
import { useAuthStore } from "@/app/store/useAuthStore";
import { toast } from "react-toastify";
import { axiosIndividual } from "@/app/api/axios";
import { sendCodeSchema, verifyCodeSchema } from "@/app/utils/validation";
import UserPhoneUpdate from "../shared components/user-phone-update";
import { Loader2Icon } from "lucide-react";

export default function IndividualPhoneUpdate() {
  const { currentUser } = useAuthStore();

  const [values, setValues] = useState({
    phone: "",
    code: "",
  });

  useEffect(() => {
    if (currentUser) {
      setValues((prev) => ({
        ...prev,
        phone: currentUser.phone || "",
      }));
    }
  }, [currentUser]);

  const [errors, setErrors] = useState({
    phone: "",
    code: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  // phone update

  const [sentChangeNumberCode, setSentChangeNumberCode] = useState("");

  const handleSendIndividualNumberCode = async () => {
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

      axiosIndividual
        .post(`individual/send-change-number-code`, {
          phone: values.phone,
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

  const handleChangeIndividualNumber = async () => {
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

      axiosIndividual
        .post(`individual/change-number`, {
          phone: values.phone,
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
      <UserPhoneUpdate
        title="მომხმარებლის ტელეფონის ნომერი"
        values={values}
        errors={errors}
        sentCode={sentChangeNumberCode}
        onChange={handleChange}
      />
      <Button
        onClick={
          sentChangeNumberCode
            ? handleChangeIndividualNumber
            : handleSendIndividualNumberCode
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
