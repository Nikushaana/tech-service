"use client";

import { axiosAdmin } from "@/app/api/axios";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import ImageSelector from "@/app/components/inputs/image-selector";
import { useParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatPhone } from "@/app/utils/phone";

interface UserValues {
  // individual
  name: string;
  lastName: string;
  // company
  companyName: string;
  companyAgentName: string;
  companyAgentLastName: string;
  companyIdentificationCode: string;

  phone: string;
  password: string;
  status: boolean;
  images: string[];
  deletedImages: string[];
  newImages: File[];
}

const fetchAdminUserById = async (userType: string, userId: string) => {
  const { data } = await axiosAdmin.get(`admin/${userType}/${userId}`);
  return data;
};

export default function Page() {
  const { userSlug } = useParams<{
    userSlug: string;
  }>();

  const userType = userSlug.split("-")[0];
  const userId = userSlug.split("-")[1];

  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["adminUser", userType, userId],
    queryFn: () => fetchAdminUserById(userType, userId),
    staleTime: 1000 * 60 * 10,
  });

  const [values, setValues] = useState<UserValues>({
    // individdual
    name: "",
    lastName: "",
    // company
    companyName: "",
    companyAgentName: "",
    companyAgentLastName: "",
    companyIdentificationCode: "",
    phone: "",
    password: "",
    status: false,
    images: [],
    deletedImages: [],
    newImages: [],
  });
  const [errors, setErrors] = useState({
    // individual
    name: "",
    lastName: "",
    // company
    companyName: "",
    companyAgentName: "",
    companyAgentLastName: "",
    companyIdentificationCode: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      const imagesArray = Array.isArray(user.images) ? user.images : [];

      setValues((prev) => ({
        ...prev,
        // individual
        name: user.name,
        lastName: user.lastName,
        // company
        companyName: user.companyName,
        companyAgentName: user.companyAgentName,
        companyAgentLastName: user.companyAgentLastName,
        companyIdentificationCode: user.companyIdentificationCode,
        phone: formatPhone(user.phone),
        password: "",
        status: user.status,
        images: imagesArray,
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [id]: id === "phone" ? formatPhone(value) : value,
    }));
  };

  // validation
  const userSchema = Yup.object().shape({
    ...(userType === "individuals"
      ? {
          name: Yup.string().required("სახელი აუცილებელია"),
          lastName: Yup.string().required("გვარი აუცილებელია"),
        }
      : {
          companyName: Yup.string().required("კომპანიის სახელი აუცილებელია"),
          companyIdentificationCode: Yup.string().required(
            "კომპანიის საიდენტიფიკაციო კოდი აუცილებელია"
          ),
          companyAgentName: Yup.string().required(
            "კომპანიის წარმომადგენლის სახელი აუცილებელია"
          ),
          companyAgentLastName: Yup.string().required(
            "კომპანიის წარმომადგენლის გვარი აუცილებელია"
          ),
        }),
    phone: Yup.string()
      .matches(
        /^5\d{2} \d{3} \d{3}$/,
        "ნომერი უნდა დაიწყოს 5-ით და იყოს ფორმატში: 5** *** ***"
      )
      .required("ტელეფონის ნომერი აუცილებელია"),
    password: Yup.string()
      .notRequired()
      .test("len", "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს", (val) => {
        if (!val) return true; // allow empty
        return val.length >= 6;
      }),
  });

  const updateUserMutation = useMutation({
    mutationFn: async (formData: FormData) =>
      axiosAdmin.patch(`admin/${userType}/${userId}`, formData),

    onSuccess: () => {
      toast.success("ინფორმაცია განახლდა", {
        position: "bottom-right",
        autoClose: 3000,
      });

      // refetch user data
      queryClient.invalidateQueries({
        queryKey: ["adminUser", userType, userId],
      });
      // refresh users list
      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });

      // reset newImages
      setValues((prev) => ({
        ...prev,
        newImages: [],
      }));
      setErrors({
        // individual
        name: "",
        lastName: "",
        // company
        companyName: "",
        companyAgentName: "",
        companyAgentLastName: "",
        companyIdentificationCode: "",
        phone: "",
        password: "",
      });
    },

    onError: () => {
      toast.error("ვერ განახლდა", {
        position: "bottom-right",
        autoClose: 3000,
      });
    },
  });

  const handleUpdateUser = async () => {
    try {
      await userSchema.validate(values, { abortEarly: false });

      const formData = new FormData();

      if (values.deletedImages.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(values.deletedImages));
      }

      // Append new files
      values.newImages.forEach((image) => {
        formData.append("images", image);
      });

      // Append other values
      if (userType === "individuals") {
        formData.append("name", values.name);
        formData.append("lastName", values.lastName);
      } else {
        formData.append("companyName", values.companyName);
        formData.append("companyAgentName", values.companyAgentName);
        formData.append("companyAgentLastName", values.companyAgentLastName);
        formData.append(
          "companyIdentificationCode",
          values.companyIdentificationCode
        );
      }
      formData.append("phone", values.phone && values.phone.replace(/\s+/g, ""));
      if (values.password) {
        formData.append("password", values.password);
      }
      formData.append("status", String(values.status));

      updateUserMutation.mutate(formData);
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
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className={`w-full flex flex-col items-center gap-y-[20px]`}>
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

      <ImageSelector
        images={values.images}
        setImages={(url: string) =>
          setValues((prev) => ({
            ...prev,
            images: prev.images.filter((img: string) => img !== url),
            deletedImages: [...prev.deletedImages, url],
          }))
        }
        newImages={values.newImages}
        setNewImages={{
          add: (files: File[]) =>
            setValues((prev) => ({
              ...prev,
              newImages: [...prev.newImages, ...files],
            })),
          remove: (file: File) =>
            setValues((prev) => ({
              ...prev,
              newImages: prev.newImages.filter((f) => f !== file),
            })),
        }}
      />
      {userType === "individuals" ? (
        <>
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
        </>
      ) : (
        <>
          <PanelFormInput
            id="companyName"
            value={values.companyName}
            onChange={handleChange}
            label="კომპანიის სახელი"
            error={errors.companyName}
          />

          <PanelFormInput
            id="companyIdentificationCode"
            value={values.companyIdentificationCode}
            onChange={handleChange}
            label="კომპანიის საიდენტიფიკაციო კოდი"
            error={errors.companyIdentificationCode}
          />
          <PanelFormInput
            id="companyAgentName"
            value={values.companyAgentName}
            onChange={handleChange}
            label="კომპანიის წარმომადგენლის სახელი"
            error={errors.companyAgentName}
          />

          <PanelFormInput
            id="companyAgentLastName"
            value={values.companyAgentLastName}
            onChange={handleChange}
            label="კომპანიის წარმომადგენლის გვარი"
            error={errors.companyAgentLastName}
          />
        </>
      )}
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
        onClick={handleUpdateUser}
        disabled={updateUserMutation.isPending}
        className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto self-end"
      >
        {updateUserMutation.isPending && (
          <Loader2Icon className="animate-spin" />
        )}
        ცვლილების შენახვა
      </Button>
    </div>
  );
}
