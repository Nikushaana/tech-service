import React, { useState } from "react";
import { toast } from "react-toastify";
import { passwordChangeSchema } from "@/app/utils/validation";
import { useParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import PanelFormInput from "../inputs/panel-form-input";
import { Button } from "@/components/ui/button";
import { axiosDelivery, axiosTechnician } from "@/app/lib/api/axios";

export default function StaffPasswordUpdate() {
  const { staffType } = useParams<{ staffType: "technician" | "delivery" }>();

  const [values, setValues] = useState({
    oldPassword: "",
    newPassword: "",
    repeatNewPassword: "",
  });

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    repeatNewPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  // change password

  const api = staffType === "technician" ? axiosTechnician : axiosDelivery;

  const handleChangeStaffPassword = async () => {
    setLoading(true);
    try {
      // Yup validation
      setErrors((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        repeatNewPassword: "",
      }));

      await passwordChangeSchema.validate(values, { abortEarly: false });

      api
        .patch(`${staffType}/change-password`, {
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
        <h2>პაროლის განახლება</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
          <PanelFormInput
            id="oldPassword"
            value={values.oldPassword}
            onChange={handleChange}
            label="ძველი პაროლი"
            error={errors.oldPassword}
            type="password"
          />
          <PanelFormInput
            id="newPassword"
            value={values.newPassword}
            onChange={handleChange}
            label="ახალი პაროლი"
            error={errors.newPassword}
            type="password"
          />
          <PanelFormInput
            id="repeatNewPassword"
            value={values.repeatNewPassword}
            onChange={handleChange}
            label="გაიმეორე ახალი პაროლი"
            error={errors.repeatNewPassword}
            type="password"
          />
        </div>
      </div>
      <Button
        onClick={handleChangeStaffPassword}
        disabled={loading}
        className="h-11 cursor-pointer self-end"
      >
        {loading && <Loader2Icon className="animate-spin" />}
        განახლება
      </Button>
    </div>
  );
}
