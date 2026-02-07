"use client";

import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PanelFormInput from "../inputs/panel-form-input";
import { Loader2Icon } from "lucide-react";
import { Dropdown } from "../inputs/drop-down";
import OrderImagesSelector from "../inputs/order-images-selector";
import OrderVideosSelector from "../inputs/order-videos-selector";
import { useUpdateOrderStore } from "@/app/store/useUpdateOrderStore";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdAddLocationAlt } from "react-icons/md";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import { useOrderTypeStatusOptionsStore } from "@/app/store/orderTypeStatusOptionsStore";
import { fetchFrontCategories } from "@/app/lib/api/frontCategories";
import { fetchUserAddresses } from "@/app/lib/api/userAddresses";
import { axiosCompany, axiosIndividual } from "@/app/lib/api/axios";

interface UpdateOrderValues {
  categoryId: string;
  brand: string;
  model: string;
  description: string;
  images: string[];
  videos: string[];
  newImages: File[];
  newVideos: File[];
}

export default function UpdateOrder() {
  const {
    currentOrder,
    openUpdateOrderModal,
    toggleOpenUpdateOrderModal,
    modalType,
  } = useUpdateOrderStore();
  const { toggleOpenCreateAddressModal } = useAddressesStore();
  const { typeOptions } = useOrderTypeStatusOptionsStore();

  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["frontCategories"],
    queryFn: fetchFrontCategories,
    enabled: openUpdateOrderModal,
    staleTime: 1000 * 60 * 10,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["userAddresses", modalType],
    queryFn: () => fetchUserAddresses(modalType),
    enabled: openUpdateOrderModal,
    staleTime: 1000 * 60 * 10,
  });

  const [values, setValues] = useState<UpdateOrderValues>({
    categoryId: "",
    brand: "",
    model: "",
    description: "",
    images: [],
    videos: [],
    newImages: [],
    newVideos: [],
  });

  const [errors, setErrors] = useState({
    categoryId: "",
    brand: "",
    model: "",
    description: "",
  });

  useEffect(() => {
    if (openUpdateOrderModal && currentOrder) {
      setValues({
        categoryId: String(currentOrder.category.id) || "",
        brand: currentOrder.brand || "",
        model: currentOrder.model || "",
        description: currentOrder.description || "",
        images: currentOrder.images || [],
        videos: currentOrder.videos || [],
        newImages: [],
        newVideos: [],
      });
    } else if (!openUpdateOrderModal) {
      // reset on close
      setValues({
        categoryId: "",
        brand: "",
        model: "",
        description: "",
        images: [],
        videos: [],
        newImages: [],
        newVideos: [],
      });
    }
  }, [openUpdateOrderModal, currentOrder]);

  const handleChange = (e: { target: { id: string; value: string } }) => {
    const { id, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const updateOrderSchema = Yup.object().shape({
    categoryId: Yup.string().required("კატეგორია აუცილებელია"),
    brand: Yup.string().required("ბრენდი აუცილებელია"),
    model: Yup.string().required("მოდელი აუცილებელია"),
    description: Yup.string().required("აღწერა აუცილებელია"),
    newImages: Yup.array()
      .of(Yup.mixed())
      .test(
        "max-total-images",
        "შეგიძლიათ ატვირთოთ მაქსიმუმ 3 სურათი",
        function (newImages) {
          const { images } = this.parent; // get existing images
          const total = (images?.length || 0) + (newImages?.length || 0);
          return total <= 3;
        },
      ),
    newVideos: Yup.array()
      .of(Yup.mixed())
      .test(
        "max-total-videos",
        "შეგიძლიათ ატვირთოთ მხოლოდ 1 ვიდეო",
        function (newVideos) {
          const { videos } = this.parent; // get existing videos
          const total = (videos?.length || 0) + (newVideos?.length || 0);
          return total <= 1;
        },
      ),
  });

  // update order

  const updateOrderMutation = useMutation({
    mutationFn: (payload: FormData) =>
      (modalType === "company" ? axiosCompany : axiosIndividual).patch(
        `${modalType}/orders/${currentOrder.id}`,
        payload,
      ),

    onSuccess: () => {
      toast.success("სერვისი განახლდა");

      // refresh orders list
      queryClient.invalidateQueries({
        queryKey: ["userOrders"],
      });
      // refresh order list
      queryClient.invalidateQueries({
        queryKey: ["userOrder"],
      });

      toggleOpenUpdateOrderModal();

      // reset form values
      setValues({
        categoryId: "",
        brand: "",
        model: "",
        description: "",
        images: [],
        videos: [],
        newImages: [],
        newVideos: [],
      });

      setErrors({
        categoryId: "",
        brand: "",
        model: "",
        description: "",
      });
    },

    onError: (error: any) => {
      if (error.response.data.message == "Inactive user cannot update orders") {
        toast.error(
          "თქვენ ვერ განაახლებთ სერვისს, რადგან თქვენი პროფილი გასააქტიურებელია"
        );
      } else {
        toast.error("სერვისი ვერ განახლდა");
      }
    },
  });

  const handleUpdateOrder = async () => {
    try {
      await updateOrderSchema.validate(values, { abortEarly: false });

      const formData = new FormData();
      formData.append("categoryId", values.categoryId);
      formData.append("brand", values.brand);
      formData.append("model", values.model);
      formData.append("description", values.description);

      formData.append(
        "imagesToDelete",
        JSON.stringify(
          currentOrder.images.filter(
            (img: string) => !values.images.includes(img),
          ),
        ),
      );
      formData.append(
        "videosToDelete",
        JSON.stringify(
          currentOrder.videos.filter(
            (img: string) => !values.videos.includes(img),
          ),
        ),
      );

      // Append new files
      values.newImages.forEach((image) => {
        formData.append("images", image);
      });

      // Append new files
      values.newVideos.forEach((video) => {
        formData.append("videos", video);
      });

      updateOrderMutation.mutate(formData);
    } catch (err: any) {
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
    }
  };

  return (
    <div
      className={`${
        openUpdateOrderModal ? "" : "opacity-0 pointer-events-none"
      } fixed inset-0 z-20 flex items-center justify-center`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          openUpdateOrderModal ? "opacity-50" : "opacity-0"
        }`}
        onClick={() => {
          toggleOpenUpdateOrderModal();
          setErrors((prev) => ({
            ...prev,
            categoryId: "",
            brand: "",
            model: "",
            description: "",
          }));

          setValues((prev) => ({
            ...prev,
            categoryId: "",
            brand: "",
            model: "",
            description: "",
          }));
        }}
      ></div>

      <div
        className={`bg-white rounded-2xl shadow-lg py-6 px-3 w-full sm:w-[600px] mx-[10px] z-[22] transition-transform duration-200 flex flex-col gap-y-[10px] max-h-[80vh] ${
          openUpdateOrderModal ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-lg font-semibold ">შეცვალე ინფორმაცია</h2>

        <div className="flex-1 overflow-y-auto showScroll pr-2">
          <div className="flex flex-col gap-y-[10px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              <div className="col-span-1 sm:col-span-2">
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
              </div>
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
                images={values.images}
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
                setImages={{
                  remove: (url: string) =>
                    setValues((prev) => ({
                      ...prev,
                      images: prev.images.filter((f) => f !== url),
                    })),
                }}
              />
              <OrderVideosSelector
                newVideos={values.newVideos}
                videos={values.videos}
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
                setVideos={{
                  remove: (url: string) =>
                    setValues((prev) => ({
                      ...prev,
                      videos: prev.videos.filter((f) => f !== url),
                    })),
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            onClick={() => {
              toggleOpenUpdateOrderModal();
              setErrors((prev) => ({
                ...prev,
                categoryId: "",
                brand: "",
                model: "",
                description: "",
              }));

              setValues((prev) => ({
                ...prev,
                categoryId: "",
                brand: "",
                model: "",
                description: "",
              }));
            }}
            className="h-[45px] px-6 cursor-pointer bg-red-500 hover:bg-[#b91c1c]"
          >
            გაუქმება
          </Button>
          <Button
            onClick={handleUpdateOrder}
            disabled={updateOrderMutation.isPending}
            className="h-[45px] px-6 text-white cursor-pointer"
          >
            {updateOrderMutation.isPending && (
              <Loader2Icon className="animate-spin" />
            )}
            განახლება
          </Button>
        </div>
      </div>
    </div>
  );
}
