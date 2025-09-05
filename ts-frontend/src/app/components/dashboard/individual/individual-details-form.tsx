"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { useAuthStore } from "@/app/store/useAuthStore";
import { toast } from "react-toastify";
import { axiosIndividual } from "@/app/api/axios";
import * as Yup from "yup";
import UserDetailsForm from "../shared components/user-details-form";
import { Loader2Icon } from "lucide-react";

export default function IndividualDetailsForm() {
  const { currentUser } = useAuthStore();

  const [values, setValues] = useState({
    name: "",
    lastName: "",
  });

  useEffect(() => {
    if (currentUser) {
      setValues((prev) => ({
        ...prev,
        name: currentUser.name || "",
        lastName: currentUser.lastName || "",
      }));
    }
  }, [currentUser]);

  const [errors, setErrors] = useState({
    name: "",
    lastName: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  // individual details update

  const updateIndividualSchema = Yup.object().shape({
    name: Yup.string().required("სახელი აუცილებელია"),
    lastName: Yup.string().required("გვარი აუცილებელია"),
  });

  const handleUpdateIndividual = async () => {
    setLoading(true);
    try {
      // Yup validation
      setErrors((prev) => ({
        ...prev,
        name: "",
        lastName: "",
      }));

      await updateIndividualSchema.validate(values, { abortEarly: false });

      axiosIndividual
        .patch(`individual`, {
          name: values.name,
          lastName: values.lastName,
        })
        .then((res) => {
          toast.success(`ინფორმაცია განახლდა`, {
            position: "bottom-right",
            autoClose: 3000,
          });
        })
        .catch((error) => {
          toast.error("ინფორმაცია ვერ განახლდა", {
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

  // define fields for shared component
  const fields = [
    { id: "name", label: "სახელი" },
    { id: "lastName", label: "გვარი" },
  ];

  return (
    <div className="flex flex-col gap-y-[20px]">
      <UserDetailsForm
        title="მომხმარებლის ინფორმაცია"
        values={values}
        errors={errors}
        onChange={(field, value) =>
          handleChange({
            target: { id: field, value },
          } as React.ChangeEvent<HTMLInputElement>)
        }
        fields={fields}
      />
      <p>სტატუსი: {currentUser?.status ? "აქტიური" : "დაბლოკილი"}</p>
      <Button
        onClick={handleUpdateIndividual}
        disabled={loading}
        className="h-11 cursor-pointer self-end"
      >
        {loading && <Loader2Icon className="animate-spin" />}ცვლილების შენახვა
      </Button>
    </div>
  );
}
