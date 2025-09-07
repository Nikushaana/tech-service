"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import { axiosCompany } from "@/app/api/axios";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PanelFormInput from "../inputs/panel-form-input";
import { Loader2Icon } from "lucide-react";

export default function CreateAddress() {
  const {
    openCreateAddressModal,
    toggleOpenCreateAddressModal,
    modalType,
    createAddress,
  } = useAddressesStore();

  const [values, setValues] = useState({
    name: "",
    city: "",
    street: "",
    building_number: "",
    building_entrance: "",
    building_floor: "",
    apartment_number: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    city: "",
    street: "",
    building_number: "",
    building_entrance: "",
    building_floor: "",
    apartment_number: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const createAddressSchema = Yup.object().shape({
    name: Yup.string().required("სახელწოდება აუცილებელია"),
    city: Yup.string().required("ქალაქი აუცილებელია"),
    street: Yup.string().required("ქუჩა აუცილებელია"),
    building_number: Yup.string().required("შენობის ნომერი აუცილებელია"),
    description: Yup.string().required("აღწერა აუცილებელია"),
  });

  const handleCreateAddress = async () => {
    setLoading(true);
    try {
      await createAddressSchema.validate(values, { abortEarly: false });

      await createAddress(modalType!, values); // or "individual" depending on user
      toggleOpenCreateAddressModal();

      // reset form values
      setValues({
        name: "",
        city: "",
        street: "",
        building_number: "",
        building_entrance: "",
        building_floor: "",
        apartment_number: "",
        description: "",
      });

      setErrors({
        name: "",
        city: "",
        street: "",
        building_number: "",
        building_entrance: "",
        building_floor: "",
        apartment_number: "",
        description: "",
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
    if (openCreateAddressModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openCreateAddressModal]);

  return (
    <div
      className={`${
        openCreateAddressModal ? "" : "opacity-0 pointer-events-none"
      } fixed inset-0 z-20 flex items-center justify-center`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          openCreateAddressModal ? "opacity-50" : "opacity-0"
        }`}
        onClick={() => toggleOpenCreateAddressModal()} // closes when clicking outside
      ></div>

      <div
        className={`bg-white rounded-2xl shadow-lg py-6 px-3 w-full sm:w-[600px] mx-[10px] z-[22] transition-transform duration-200 flex flex-col gap-y-[10px] max-h-[70vh] ${
          openCreateAddressModal
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-lg font-semibold ">მისამართის დამატება</h2>

        <div className="flex-1 overflow-y-auto showScroll pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
            <div className="col-span-1 sm:col-span-2">
              <PanelFormInput
                id="name"
                value={values.name || ""}
                onChange={handleChange}
                label="მისამართის სახელი"
                error={errors.name}
              />
            </div>
            <PanelFormInput
              id="city"
              value={values.city || ""}
              onChange={handleChange}
              label="ქალაქი"
              error={errors.city}
            />
            <PanelFormInput
              id="street"
              value={values.street || ""}
              onChange={handleChange}
              label="ქუჩა"
              error={errors.street}
            />
            <PanelFormInput
              id="building_number"
              value={values.building_number || ""}
              onChange={handleChange}
              label="შენობის ნომერი"
              error={errors.building_number}
            />
            <PanelFormInput
              id="building_entrance"
              value={values.building_entrance || ""}
              onChange={handleChange}
              label="შესასვლელი"
              error={errors.building_entrance}
            />
            <PanelFormInput
              id="building_floor"
              value={values.building_floor || ""}
              onChange={handleChange}
              label="სართული"
              error={errors.building_floor}
            />
            <PanelFormInput
              id="apartment_number"
              value={values.apartment_number || ""}
              onChange={handleChange}
              label="ბინის ნომერი"
              error={errors.apartment_number}
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
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            onClick={() => {
              toggleOpenCreateAddressModal();
              setErrors((prev) => ({
                ...prev,
                name: "",
                city: "",
                street: "",
                building_number: "",
                description: "",
              }));

              setValues((prev) => ({
                ...prev,
                name: "",
                city: "",
                street: "",
                building_number: "",
                building_entrance: "",
                building_floor: "",
                apartment_number: "",
                description: "",
              }));
            }}
            className="h-[45px] px-6 cursor-pointer bg-red-500 hover:bg-[#b91c1c]"
          >
            გაუქმება
          </Button>
          <Button
            onClick={handleCreateAddress}
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
