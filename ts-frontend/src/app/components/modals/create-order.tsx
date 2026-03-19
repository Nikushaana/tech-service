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
import { useOrderTypeStatusOptionsStore } from "@/app/store/orderTypeStatusOptionsStore";
import { fetchFrontCategories } from "@/app/lib/api/frontCategories";
import { fetchUserAddresses } from "@/app/lib/api/userAddresses";
import { fetchUserCalculatePrice } from "@/app/lib/api/userCalculatePrice";
import { api } from "@/app/lib/api/axios";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

interface CreateOrderValues {
  serviceType: OrderType | "";
  categoryId: string;
  addressId: string;
  brand: string;
  model: string;
  description: string;
  newImages: File[];
  newVideos: File[];
}

const initialValues: CreateOrderValues = {
  serviceType: "",
  categoryId: "",
  addressId: "",
  brand: "",
  model: "",
  description: "",
  newImages: [],
  newVideos: [],
};

const initialErrors = {
  serviceType: "",
  categoryId: "",
  addressId: "",
  brand: "",
  model: "",
  description: "",
};

export default function CreateOrder() {
  const router = useRouter();
  const { openCreateOrderModal, toggleOpenCreateOrderModal } = useOrdersStore();
  const { toggleOpenCreateAddressModal } = useAddressesStore();
  const { typeOptions } = useOrderTypeStatusOptionsStore();
  const { data: currentUser } = useCurrentUser();

  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["frontCategories"],
    queryFn: fetchFrontCategories,
    enabled: openCreateOrderModal,
    staleTime: 1000 * 60 * 10,
  });

  const { data: addresses } = useQuery({
    queryKey: ["userAddresses", currentUser?.role],
    queryFn: () => fetchUserAddresses(currentUser.role),
    enabled: openCreateOrderModal,
    staleTime: 1000 * 60 * 10,
  });

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);

  const resetForm = () => {
    setValues(initialValues);
    setErrors(initialErrors);
    sessionStorage.removeItem("pendingTecheroOrder");
  };

  const handleChange = (e: { target: { id: string; value: string } }) => {
    const { id, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // calculate price
  const { data: price, isLoading: isLoadingPrice } = useQuery({
    queryKey: [
      "userCalculatedPrice",
      currentUser?.role,
      values.serviceType,
      values.addressId,
    ],
    queryFn: () =>
      fetchUserCalculatePrice(currentUser.role, {
        addressId: +values.addressId,
        service_type: values.serviceType as OrderType,
      }),
    enabled: openCreateOrderModal && !!values.serviceType && !!values.addressId,
    staleTime: 1000 * 60 * 10,
  });

  const orderSchema = Yup.object().shape({
    serviceType: Yup.string()
      .transform((value) => (value === "" ? undefined : value))
      .required("სერვისის ტიპი აუცილებელია")
      .oneOf(
        typeOptions.map((o) => o.id),
        "არასწორი სერვისის ტიპი",
      ),
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
      api.post(`${currentUser.role}/create-order`, payload),

    onSuccess: () => {
      toast.success("განაცხადი დაემატა");

      // refresh orders list
      queryClient.invalidateQueries({
        queryKey: ["userOrders"],
      });

      toggleOpenCreateOrderModal();
      resetForm();
    },

    onError: (error: any) => {
      if (
        error.response.data.message ==
        "Address is outside all branch coverage areas. Please choose a closer location."
      ) {
        toast.error("აირჩიე მისამართი რომელიც სერვისის დაფარვის ზონაშია");
      } else if (
        error.response.data.message == "Inactive user cannot create orders"
      ) {
        toast.error(
          "თქვენ ვერ დაამატებთ შეკვეთას, რადგან თქვენი პროფილი გასააქტიურებელია",
        );
      } else {
        toast.error("შეკვეთა ვერ დაემატა");
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
            toast.error(e.message);
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleWrapperClick = () => {
    if (!currentUser) {
      if (
        values.serviceType ||
        values.categoryId ||
        values.addressId ||
        values.brand.trim() ||
        values.model.trim() ||
        values.description.trim() ||
        values.newImages.length > 0 ||
        values.newVideos.length > 0
      ) {
        sessionStorage.setItem(
          "pendingTecheroOrder",
          JSON.stringify("pendingTecheroOrder"),
        );
      }

      toggleOpenCreateOrderModal();
      router.push("/auth/login");
      setErrors(initialErrors);
      toast.info("განაცხადის შესავსებად გაიარე ავტორიზაცია");
      return;
    }

    if ((addresses?.total ?? 0) <= 0) {
      toggleOpenCreateAddressModal(currentUser.role);
    }
  };

  const shouldDisable = !currentUser || (addresses?.total ?? 0) <= 0;

  return (
    <div
      className={`${
        openCreateOrderModal ? "" : "opacity-0 pointer-events-none"
      } fixed inset-0 z-20 flex items-center justify-center duration-200`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          openCreateOrderModal ? "opacity-50" : "opacity-0"
        }`}
        onClick={() => {
          toggleOpenCreateOrderModal();
          resetForm();
        }}
      ></div>

      <div
        className={`bg-white rounded-[20px] sm:rounded-[30px] shadow-lg py-4 px-3 sm:py-6 sm:px-5 w-full sm:w-[600px] mx-[10px] z-[22] duration-200 flex flex-col gap-y-[10px] max-h-[80vh] ${
          openCreateOrderModal ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-lg ">შეავსე განაცხადი</h2>
        <hr />
        <div className="flex-1 overflow-y-auto showScroll pr-2">
          <div className="flex flex-col gap-y-[10px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              <div className="col-span-1 sm:col-span-2">
                <Dropdown
                  data={typeOptions}
                  id="serviceType"
                  value={values.serviceType}
                  label="სერვისის ტიპი"
                  placeholder="მაგ: შეკეთება სერვისცენტრში"
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
                placeholder="მაგ: მაცივარი"
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
                placeholder="მაგ: ბოში"
                error={errors.brand}
              />
              <PanelFormInput
                id="model"
                value={values.model || ""}
                onChange={handleChange}
                label="მოდელი"
                placeholder="მაგ: KDN43VL20U"
                error={errors.model}
              />
              <div
                onClick={handleWrapperClick}
                className="flex items-end gap-1"
              >
                <div
                  className={`flex-1 ${shouldDisable && "pointer-events-none"}`}
                >
                  <Dropdown
                    data={addresses?.data}
                    id="addressId"
                    value={values.addressId}
                    label="მისამართი"
                    placeholder="მაგ: სახლი"
                    valueKey="id"
                    labelKey="name"
                    onChange={handleChange}
                    error={errors.addressId}
                  />
                </div>
                <Button
                  onClick={() => {
                    (addresses?.total ?? 0) > 0 &&
                      currentUser &&
                      toggleOpenCreateAddressModal(currentUser.role);
                  }}
                  variant="secondary"
                  className={`h-9 aspect-square rounded-[8px] bg-myLightBlue hover:bg-myBlue text-white text-[18px] cursor-pointer
                    ${shouldDisable && "pointer-events-none"}`}
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
                  placeholder="მაგ: მაცივარი აღარ ყინავს.."
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
                newVideos={values.newVideos}
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

        <div className="flex gap-3 justify-end">
          <Button
            onClick={() => {
              toggleOpenCreateOrderModal();
              resetForm();
            }}
            variant="outline"
            className="cursor-pointer"
          >
            დახურვა
          </Button>
          <Button
            onClick={handleCreateOrder}
            disabled={addOrderMutation.isPending}
            className="cursor-pointer"
          >
            {(addOrderMutation.isPending || isLoadingPrice) && (
              <Loader2Icon className="animate-spin" />
            )}
            დამატება {price?.price && `(${price.price}₾)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
