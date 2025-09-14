"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PanelFormInput from "../inputs/panel-form-input";
import { Loader2Icon } from "lucide-react";
import { useOrdersStore } from "@/app/store/useOrdersStore";
import { Dropdown } from "../inputs/drop-down-menu";
import { useCategoriesStore } from "@/app/store/useCategoriesStore";
import ImageSelector from "../inputs/image-selector";
import VideoSelector from "../inputs/video.selector";

interface CreateOrderValues {
  categoryId: string | number;
  addressId: string | number;
  brand: string;
  model: string;
  description: string;
  newImages: File[];
  newVideos: File[];
}

export default function CreateOrder() {
  const {
    openCreateOrderModal,
    toggleOpenCreateOrderModal,
    modalType,
    createOrder,
  } = useOrdersStore();

  const { addresses } = useAddressesStore();
  const { categories } = useCategoriesStore();

  const [values, setValues] = useState<CreateOrderValues>({
    categoryId: "",
    addressId: "",
    brand: "",
    model: "",
    description: "",
    newImages: [],
    newVideos: [],
  });

  const [errors, setErrors] = useState({
    categoryId: "",
    addressId: "",
    brand: "",
    model: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { id: string; value: string } }
  ) => {
    const { id, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [id]:
        id === "categoryId" || id === "addressId"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const createOrderSchema = Yup.object().shape({
    categoryId: Yup.string().required("კატეგორია აუცილებელია"),
    brand: Yup.string().required("ბრენდი აუცილებელია"),
    model: Yup.string().required("მოდელი აუცილებელია"),
    description: Yup.string().required("აღწერა აუცილებელია"),
    addressId: Yup.string().required("მისამართი აუცილებელია"),
    newImages: Yup.array()
      .max(3, "შეგიძლიათ ატვირთოთ მაქსიმუმ 3 სურათი")
      .of(Yup.mixed().required()),
    newVideos: Yup.array()
      .max(1, "შეგიძლიათ ატვირთოთ მხოლოდ 1 ვიდეო")
      .of(Yup.mixed().required()),
  });

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      await createOrderSchema.validate(values, { abortEarly: false });

      const formData = new FormData();
      formData.append("categoryId", String(values.categoryId));
      formData.append("brand", values.brand);
      formData.append("model", values.model);
      formData.append("description", values.description);
      formData.append("addressId", String(values.addressId));

      // Append new files
      values.newImages.forEach((image) => {
        formData.append("images", image);
      });

      // Append new files
      values.newVideos.forEach((video) => {
        formData.append("videos", video);
      });

      await createOrder(modalType!, formData); // or "individual" depending on user
      toggleOpenCreateOrderModal();

      // reset form values
      setValues({
        categoryId: "",
        brand: "",
        model: "",
        description: "",
        addressId: "",
        newImages: [],
        newVideos: [],
      });

      setErrors({
        categoryId: "",
        brand: "",
        model: "",
        description: "",
        addressId: "",
      });

      setLoading(false);
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

  useEffect(() => {
    if (openCreateOrderModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openCreateOrderModal]);

  return (
    <div
      className={`${
        openCreateOrderModal ? "" : "opacity-0 pointer-events-none"
      } fixed inset-0 z-20 flex items-center justify-center`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          openCreateOrderModal ? "opacity-50" : "opacity-0"
        }`}
        onClick={() => toggleOpenCreateOrderModal()} // closes when clicking outside
      ></div>

      <div
        className={`bg-white rounded-2xl shadow-lg py-6 px-3 w-full sm:w-[600px] mx-[10px] z-[22] transition-transform duration-200 flex flex-col gap-y-[10px] max-h-[80vh] ${
          openCreateOrderModal ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-lg font-semibold ">შეკვეთის დამატება</h2>
        <div className="flex-1 overflow-y-auto showScroll pr-2">
          <div className="flex flex-col gap-y-[10px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              <Dropdown
                data={categories.data}
                id="categoryId"
                value={values.categoryId || ""}
                onChange={handleChange}
                label="კატეგორია"
                error={errors.categoryId}
              />
              <PanelFormInput
                id="brand"
                value={values.brand || ""}
                onChange={handleChange}
                label="ბრენდი"
                error={errors.brand}
              />
              <PanelFormInput
                id="model"
                value={values.model || ""}
                onChange={handleChange}
                label="მოდელი"
                error={errors.model}
              />
              <Dropdown
                data={addresses}
                id="addressId"
                value={values.addressId || ""}
                onChange={handleChange}
                label="მისამართი"
                error={errors.addressId}
              />
              <div className="col-span-1 sm:col-span-2">
                <PanelFormInput
                  id="description"
                  value={values.description || ""}
                  onChange={handleChange}
                  label="აღწერა"
                  error={errors.description}
                />
              </div>
            </div>
            <div className="flex flex-col gap-[10px] overflow-x-scroll showXScroll">
              <ImageSelector
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
              <VideoSelector
                newVideos={values.newVideos} // use the correct field
                setNewVideos={{
                  add: (files: File[]) =>
                    setValues((prev) => ({
                      ...prev,
                      newVideos: [...prev.newVideos, ...files],
                    })),
                  remove: (file: File) =>
                    setValues((prev) => ({
                      ...prev,
                      newVideos: prev.newVideos.filter((f) => f !== file),
                    })),
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            onClick={() => {
              toggleOpenCreateOrderModal();
              setErrors((prev) => ({
                ...prev,
                categoryId: "",
                brand: "",
                model: "",
                description: "",
                addressId: "",
              }));

              setValues((prev) => ({
                ...prev,
                categoryId: "",
                brand: "",
                model: "",
                description: "",
                addressId: "",
              }));
            }}
            className="h-[45px] px-6 cursor-pointer bg-red-500 hover:bg-[#b91c1c]"
          >
            გაუქმება
          </Button>
          <Button
            onClick={handleCreateOrder}
            disabled={loading}
            className="h-[45px] px-6 text-white cursor-pointer"
          >
            {loading && <Loader2Icon className="animate-spin" />}
            დამატება
          </Button>
        </div>
      </div>
    </div>
  );
}
