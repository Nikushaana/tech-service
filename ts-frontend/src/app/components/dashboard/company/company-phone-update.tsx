"use client";

import React, { useEffect, useState } from "react";
import PanelFormInput from "../../inputs/panel-form-input";
import { Button } from "../../ui/button";
import { useAuthStore } from "@/app/store/useAuthStore";
import { toast } from "react-toastify";
import { axiosCompany } from "@/app/api/axios";
import { sendCodeSchema, verifyCodeSchema } from "@/app/utils/validation";
import UserPhoneUpdate from "../shared components/user-phone-update";

export default function CompanyPhoneUpdate() {
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

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  // phone update

  const [sentChangeNumberCode, setSentChangeNumberCode] = useState("");

  const handleSendCompanyAgentNumberCode = async () => {
    try {
      // Yup validation
      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));

      await sendCodeSchema.validate(values, {
        abortEarly: false,
      });

      axiosCompany
        .post(`company/send-change-number-code`, {
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
        .finally(() => {});
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
    }
  };

  const handleChangeCompanyAgentNumber = async () => {
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

      axiosCompany
        .post(`company/change-number`, {
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
        .finally(() => {});
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
    }
  };

  return (
    <UserPhoneUpdate
      title="კომპანიის წარმომადგენლის ტელეფონის ნომერი"
      values={values}
      errors={errors}
      sentCode={sentChangeNumberCode}
      onChange={handleChange}
      onSendCode={handleSendCompanyAgentNumberCode}
      onVerifyCode={handleChangeCompanyAgentNumber}
    />
  );
}
