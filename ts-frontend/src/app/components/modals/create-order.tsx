"use client";

import { useEffect, useState } from "react";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PanelFormInput from "../inputs/panel-form-input";
import { Loader2Icon } from "lucide-react";
import { MdAddLocationAlt } from "react-icons/md";
import { useOrdersStore } from "@/app/store/useOrdersStore";
import { Dropdown } from "../inputs/drop-down";
import OrderImagesSelector from "../inputs/order-images-selector";
import OrderVideosSelector from "../inputs/order-videos-selector";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFrontCategories } from "@/app/api/frontCategories";
import { axiosCompany, axiosIndividual } from "@/app/api/axios";
import { fetchUserAddresses } from "@/app/api/userAddresses";
import { useOrderTypeStatusOptionsStore } from "@/app/store/orderTypeStatusOptionsStore";

interface CreateOrderValues {
  serviceType: string;
  categoryId: string;
  addressId: string;
  brand: string;
  model: string;
  description: string;
  newImages: File[];
  newVideos: File[];
}

export default function CreateOrder() {
  const { openCreateOrderModal, toggleOpenCreateOrderModal, modalType } =
    useOrdersStore();
  const { toggleOpenCreateAddressModal } = useAddressesStore();
  const { typeOptions } = useOrderTypeStatusOptionsStore();

  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["frontCategories"],
    queryFn: fetchFrontCategories,
    enabled: openCreateOrderModal,
    staleTime: 1000 * 60 * 10,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["userAddresses", modalType],
    queryFn: () => fetchUserAddresses(modalType),
    enabled: openCreateOrderModal,
    staleTime: 1000 * 60 * 10,
  });

  const [values, setValues] = useState<CreateOrderValues>({
    serviceType: "",
    categoryId: "",
    addressId: "",
    brand: "",
    model: "",
    description: "",
    newImages: [],
    newVideos: [],
  });

  const [errors, setErrors] = useState({
    serviceType: "",
    categoryId: "",
    addressId: "",
    brand: "",
    model: "",
    description: "",
  });

  const handleChange = (e: { target: { id: string; value: string } }) => {
    const { id, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const orderSchema = Yup.object().shape({
    serviceType: Yup.string()
      .oneOf(
        typeOptions.map((o) => o.id),
        "არასწორი სერვისის ტიპი"
      )
      .required("აირჩიე სერვისის ტიპი"),
    categoryId: Yup.string().required("კატეგორია აუცილებელია"),
    brand: Yup.string().required("ბრენდი აუცილებელია"),
    model: Yup.string().required("მოდელი აუცილებელია"),
    description: Yup.string().required("აღწერა აუცილებელია"),
    addressId: Yup.string().required("მისამართი აუცილებელია"),
    newImages: Yup.array()
      .max(3, "შეგიძლიათ ატვირთოთ მაქსიმუმ 3 სურათი")
      .of(Yup.mixed()),
    newVideos: Yup.array()
      .max(1, "შეგიძლიათ ატვირთოთ მხოლოდ 1 ვიდეო")
      .of(Yup.mixed()),
  });

  // add order
  const addOrderMutation = useMutation({
    mutationFn: (payload: FormData) =>
      (modalType === "company" ? axiosCompany : axiosIndividual).post(
        `${modalType}/create-order`,
        payload
      ),

    onSuccess: () => {
      toast.success("შეკვეთა დაემატა", {
        position: "bottom-right",
        autoClose: 3000,
      });

      // refresh orders list
      queryClient.invalidateQueries({
        queryKey: ["userOrders"],
      });

      toggleOpenCreateOrderModal();

      setValues({
        serviceType: "",
        categoryId: "",
        brand: "",
        model: "",
        description: "",
        addressId: "",
        newImages: [],
        newVideos: [],
      });

      setErrors({
        serviceType: "",
        categoryId: "",
        brand: "",
        model: "",
        description: "",
        addressId: "",
      });
    },

    onError: (error: any) => {
      if (
        error.response.data.message ==
        "Address is outside all branch coverage areas. Please choose a closer location."
      ) {
        toast.error("აირჩიე მისამართი რომელიც სერვისის დაფარვის ზონაშია", {
          position: "bottom-right",
          autoClose: 3000,
        });
      } else if (
        error.response.data.message == "Inactive user cannot create orders"
      ) {
        toast.error(
          "თქვენ ვერ დაამატებთ შეკვეთას, რადგან თქვენი პროფილი გასააქტიურებელია",
          { position: "bottom-right", autoClose: 3000 }
        );
      } else {
        toast.error("შეკვეთა ვერ დაემატა", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    },
  });

  const handleCreateOrder = async () => {
    try {
      await orderSchema.validate(values, { abortEarly: false });

      const formData = new FormData();
      formData.append("service_type", values.serviceType);
      formData.append("categoryId", values.categoryId);
      formData.append("brand", values.brand);
      formData.append("model", values.model);
      formData.append("description", values.description);
      formData.append("addressId", values.addressId);

      // Append new files
      values.newImages.forEach((image) => {
        formData.append("images", image);
      });

      // Append new files
      values.newVideos.forEach((video) => {
        formData.append("videos", video);
      });

      addOrderMutation.mutate(formData);
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
        <h2 className="text-lg font-semibold ">შეავსე განაცხადი</h2>
        <div className="flex-1 overflow-y-auto showScroll pr-2">
          <div className="flex flex-col gap-y-[10px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              <div className="col-span-1 sm:col-span-2">
                <Dropdown
                  data={typeOptions}
                  id="serviceType"
                  value={values.serviceType}
                  label="სერვისის ტიპი"
                  valueKey="id"
                  labelKey="name"
                  onChange={handleChange}
                  error={errors.serviceType}
                />
              </div>
              <Dropdown
                data={categories?.data}
                id="categoryId"
                value={values.categoryId}
                label="კატეგორია"
                valueKey="id"
                labelKey="name"
                onChange={handleChange}
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
              <div
                onClick={() => {
                  addresses.length <= 0 &&
                    modalType &&
                    toggleOpenCreateAddressModal(modalType);
                }}
                className="flex items-end gap-1"
              >
                <div
                  className={`flex-1 ${
                    addresses.length <= 0 && "pointer-events-none"
                  }`}
                >
                  <Dropdown
                    data={addresses}
                    id="addressId"
                    value={values.addressId}
                    label="მისამართი"
                    valueKey="id"
                    labelKey="name"
                    onChange={handleChange}
                    error={errors.addressId}
                  />
                </div>
                <Button
                  onClick={() => {
                    addresses.length > 0 &&
                      modalType &&
                      toggleOpenCreateAddressModal(modalType);
                  }}
                  variant="secondary"
                  className="h-9 aspect-square rounded-[8px] bg-myLightBlue hover:bg-myBlue text-white text-[18px]"
                >
                  <MdAddLocationAlt />
                </Button>
              </div>
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
              <OrderImagesSelector
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
              <OrderVideosSelector
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
                serviceType: "",
                categoryId: "",
                brand: "",
                model: "",
                description: "",
                addressId: "",
              }));

              setValues((prev) => ({
                ...prev,
                serviceType: "",
                categoryId: "",
                brand: "",
                model: "",
                description: "",
                addressId: "",
                newImages: [],
                newVideos: [],
              }));
            }}
            className="h-[45px] px-6 cursor-pointer bg-red-500 hover:bg-[#b91c1c]"
          >
            გაუქმება
          </Button>
          <Button
            onClick={handleCreateOrder}
            disabled={addOrderMutation.isPending}
            className="h-[45px] px-6 text-white cursor-pointer"
          >
            {addOrderMutation.isPending && (
              <Loader2Icon className="animate-spin" />
            )}
            დამატება
          </Button>
        </div>
      </div>
    </div>
  );
}
