"use client";

import { axiosAdmin } from "@/app/api/axios";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { Switch } from "@/app/components/ui/switch";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Button } from "@/app/components/ui/button";

interface FaqPageProps {
  params: Promise<{
    technicianId: string;
  }>;
}

export default function Page({ params }: FaqPageProps) {
  const resolvedParams = React.use(params);
  const { technicianId } = resolvedParams;

  const [loading, setLoading] = useState<boolean>(true);
  const [values, setValues] = useState({
    name: "",
    lastName: "",
    phone: "",
    password: "",
    status: false,
  });
  const [errors, setErrors] = useState({
    name: "",
    lastName: "",
    phone: "",
    password: "",
  });

  const fetchTechnician = () => {
    setLoading(true);
    axiosAdmin
      .get(`/admin/technicians/${technicianId}`)
      .then((res) => {
        const data = res.data;
        setValues({
          name: data.name,
          lastName: data.lastName,
          phone: data.phone,
          password: "",
          status: data.status,
        });
        setLoading(false);
      })
      .catch(() => {})
      .finally(() => {});
  };

  useEffect(() => {
    fetchTechnician();
  }, [technicianId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // validation
  const technicianSchema = Yup.object().shape({
    name: Yup.string().required("სახელი აუცილებელია"),
    lastName: Yup.string().required("გვარი აუცილებელია"),
    phone: Yup.string()
      .matches(/^5\d{8}$/, "ნომერი უნდა დაიწყოს 5-ით და იყოს 9 ციფრი")
      .required("ტელეფონის ნომერი აუცილებელია"),
    password: Yup.string()
      .notRequired()
      .test("len", "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს", (val) => {
        if (!val) return true; // allow empty
        return val.length >= 6;
      }),
  });

  const handleUpdateTechnician = async () => {
    setLoading(true);
    try {
      await technicianSchema.validate(values, { abortEarly: false });

      axiosAdmin
        .patch(`/admin/technicians/${technicianId}`, values)
        .then(() => {
          toast.success("ტექნიკოსი განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });
          fetchTechnician();
          setErrors({ name: "", lastName: "", phone: "", password: "" });
        })
        .catch(() => {
          toast.error("ვერ განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });
          setLoading(false);
        });
    } catch (err: any) {
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
    <div className={`w-full flex flex-col items-center gap-y-[20px]`}>
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm">
            <p>დაბლოკილი</p>
            <Switch
              checked={values.status}
              onCheckedChange={(checked) =>
                setValues((prev) => ({ ...prev, status: checked }))
              }
              className="cursor-pointer"
            />
            <p>აქტიური</p>
          </div>

          <PanelFormInput
            id="name"
            value={values.name}
            onChange={handleChange}
            label="სახელი"
            error={errors.name}
          />

          <PanelFormInput
            id="lastName"
            value={values.lastName}
            onChange={handleChange}
            label="გვარი"
            error={errors.lastName}
          />
          <PanelFormInput
            id="phone"
            value={values.phone}
            onChange={handleChange}
            label="ტელეფონის ნომერი"
            error={errors.phone}
          />
          <PanelFormInput
            id="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            label="პაროლი"
            error={errors.password}
          />

          <Button
            onClick={handleUpdateTechnician}
            disabled={loading}
            className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto self-end"
          >
            {loading && <Loader2Icon className="animate-spin mr-2" />}
            ცვლილების შენახვა
          </Button>
        </>
      )}
    </div>
  );
}
