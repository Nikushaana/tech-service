import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosIndividual } from "@/app/api/axios";
import { passwordChangeSchema } from "@/app/utils/validation";
import { useAuthStore } from "@/app/store/useAuthStore";
import UserPasswordUpdate from "../shared components/user-password-update";

export default function IndividualPasswordUpdate() {
  const { currentUser } = useAuthStore();

  const [values, setValues] = useState({
    oldPassword: "",
    newPassword: "",
    repeatNewPassword: "",
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
    oldPassword: "",
    newPassword: "",
    repeatNewPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  // change password

  const handleChangeIndividualPassword = async () => {
    try {
      // Yup validation
      setErrors((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        repeatNewPassword: "",
      }));

      await passwordChangeSchema.validate(values, { abortEarly: false });

      axiosIndividual
        .patch(`individual/change-password`, {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        })
        .then((res) => {
          setValues((prev) => ({
            ...prev,
            oldPassword: "",
            newPassword: "",
            repeatNewPassword: "",
          }));

          toast.success(`პაროლი განახლდა`, {
            position: "bottom-right",
            autoClose: 3000,
          });
        })
        .catch((error) => {
          if (error.response.data.message === "Old password is incorrect") {
            setErrors((prev) => ({
              ...prev,
              oldPassword: "შეცდომა",
            }));
            toast.error("ძველი პაროლი არასწორია", {
              position: "bottom-right",
              autoClose: 3000,
            });
          } else {
            toast.error("პაროლი ვერ განახლდა", {
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
  return (
    <UserPasswordUpdate
      title="პაროლის განახლება"
      values={values}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleChangeIndividualPassword}
    />
  );
}
