"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { toast } from "react-toastify";
import { sendCodeSchema, verifyCodeSchema } from "@/app/utils/validation";
import UserPhoneUpdate from "../shared components/user-phone-update";
import { formatPhone } from "@/app/utils/formatPhone";
import { axiosIndividual } from "@/app/lib/api/axios";

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
        phone: formatPhone(currentUser.phone) || "",
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
          phone: values.phone && values.phone.replace(/\s+/g, ""),
        })
        .then((res) => {
          setSentChangeNumberCode(res.data.code);
          toast.success(`კოდი გამოიგზავნა`);
        })
        .catch((error) => {
          setErrors((prev) => ({
            ...prev,
            phone: "შეცდომა",
          }));

          if (error.response.data.message === "Phone already used") {
            toast.error("ტელეფონის ნომერი გამოყენებულია");
          } else {
            toast.error("კოდი ვერ გამოიგზავნა");
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
            toast.error(e.message);
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
          phone: values.phone && values.phone.replace(/\s+/g, ""),
          code: values.code,
        })
        .then((res) => {
          setSentChangeNumberCode("");
          setValues((prev) => ({
            ...prev,
            code: "",
          }));
          toast.success(`ტელეფონის ნომერი განახლდა`);
        })
        .catch((error) => {
          setErrors((prev) => ({
            ...prev,
            code: "შეცდომა",
          }));

          toast.error("ტელეფონის ნომერი ვერ განახლდა");
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
            toast.error(e.message);
          }
        });
        setErrors(newErrors);
      }
      setLoading(false);
    }
  };

  return (
    <UserPhoneUpdate
      title="მომხმარებლის ტელეფონის ნომერი"
      values={values}
      errors={errors}
      sentCode={sentChangeNumberCode}
      onChange={handleChange}
      onSubmit1={handleChangeIndividualNumber}
      onSubmit2={handleSendIndividualNumberCode}
      loading={loading}
    />
  );
}
