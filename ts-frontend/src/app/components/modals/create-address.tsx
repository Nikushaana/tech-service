"use client";

import React, { useState } from "react";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PanelFormInput from "../inputs/panel-form-input";
import { Loader2Icon } from "lucide-react";
import Map from "../map/map";
import { Dropdown2 } from "../inputs/drop-down-2";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchStreets } from "@/app/lib/api/locations";
import { api } from "@/app/lib/api/axios";

const initialValues = {
  name: "",
  street: "",
  building_number: "",
  description: "",
  location: null as LatLng | null,
};

const initialErrors = {
  name: "",
  street: "",
  building_number: "",
  description: "",
  location: "",
};

const initialHelperValues = {
  searchStreet: "",
  streetLocation: null as LatLng | null,
  isSelectingStreet: false,
};

export default function CreateAddress() {
  const { openCreateAddressModal, toggleOpenCreateAddressModal, modalType } =
    useAddressesStore();

  const queryClient = useQueryClient();

  const [values, setValues] = useState(initialValues);

  const [errors, setErrors] = useState(initialErrors);

  const [helperValues, setHelperValues] = useState(initialHelperValues);

  const resetForm = () => {
    setValues(initialValues);
    setErrors(initialErrors);
    setHelperValues(initialHelperValues);
  };

  const { data: streetsData = [], isLoading: streetLoading } = useQuery({
    queryKey: ["streets", helperValues.searchStreet],
    queryFn: () => fetchStreets(helperValues.searchStreet),
    enabled:
      !helperValues.isSelectingStreet && helperValues.searchStreet.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    if (id === "location" && typeof value === "object") {
      setValues((prev) => ({ ...prev, location: value as LatLng }));
      return;
    }

    setValues((prev) => ({ ...prev, [id]: value }));
  };

  // Generic handler for dropdown (street)
  const handleDropdownChange = (value: string) => {
    setHelperValues((prev) => ({
      ...prev,
      searchStreet: value,
      isSelectingStreet: false,
    }));

    // Reset form value (street) when typing
    setValues((prev) => ({
      ...prev,
      street: value,
      location: null,
    }));
  };

  // Generic handler for selecting dropdown item
  const handleDropdownSelect = (item: any) => {
    setValues((prev) => ({
      ...prev,
      street: item.name,
    }));

    setHelperValues((prev) => ({
      ...prev,
      searchStreet: item.name,
      streetLocation: item.location,
      isSelectingStreet: true,
    }));
  };

  const addressSchema = Yup.object().shape({
    name: Yup.string().required("სახელი აუცილებელია"),
    street: Yup.string().required("ქუჩა აუცილებელია"),
    building_number: Yup.string().required("შენობის ნომერი აუცილებელია"),
    description: Yup.string().required("დამატებითი ინფორმაცია აუცილებელია"),
    location: Yup.object()
      .shape({
        lat: Yup.number().required(),
        lng: Yup.number().required(),
      })
      .required("მდებარეობა რუკაზე აუცილებელია"),
  });

  //add address
  const addAddressMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      street: string;
      building_number: string;
      description: string;
      location: LatLng | null;
    }) => api.post(`${modalType}/create-address`, payload),

    onSuccess: () => {
      toast.success("მისამართი დაემატა");

      // refresh addresses list
      queryClient.invalidateQueries({
        queryKey: ["userAddresses"],
      });

      toggleOpenCreateAddressModal();

      // reset form
      resetForm();
    },

    onError: (error: any) => {
      if (
        error.response.data.message ==
        "You already have an address with this name."
      ) {
        toast.error("მისამართი ამ სახელით უკვე არსებობს");
        setErrors((prev) => ({ ...prev, name: "error" }));
      } else {
        toast.error("მისამართი ვერ დაემატა");
      }
    },
  });

  const handleCreateAddress = async () => {
    try {
      await addressSchema.validate(values, { abortEarly: false });

      addAddressMutation.mutate(values);
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
        openCreateAddressModal ? "" : "opacity-0 pointer-events-none"
      } fixed inset-0 z-30 flex items-center justify-center`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          openCreateAddressModal ? "opacity-50" : "opacity-0"
        }`}
        onClick={() => {
          toggleOpenCreateAddressModal();
          resetForm();
        }}
      ></div>

      <div
        className={`bg-white rounded-[20px] sm:rounded-[30px] shadow-lg py-4 px-3 sm:py-6 sm:px-5 w-full sm:w-[600px] mx-[10px] z-[22] duration-200 flex flex-col gap-y-[10px] max-h-[90vh] ${
          openCreateAddressModal
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-lg ">მისამართის დამატება</h2>

        <hr />

        <div className="flex-1 overflow-y-auto showScroll pr-2">
          <div className="space-y-2">
            <PanelFormInput
              id="name"
              value={values.name || ""}
              onChange={handleChange}
              label="მისამართის სახელი"
              placeholder="მაგ: სახლი, სამსახური..."
              error={errors.name}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Dropdown2
                id="searchStreet"
                data={streetsData}
                value={helperValues.searchStreet}
                onChange={(e) => handleDropdownChange(e.target.value)}
                onSelect={handleDropdownSelect}
                label="ქუჩა"
                placeholder="მაგ: იოსელიანის ქუჩა"
                isLoading={streetLoading}
                error={errors.street}
              />
              <PanelFormInput
                id="building_number"
                value={values.building_number || ""}
                onChange={handleChange}
                label="შენობის ნომერი"
                placeholder="მაგ: 32ა"
                error={errors.building_number}
              />
              <div className="col-span-1 sm:col-span-2">
                <PanelFormInput
                  id="description"
                  value={values.description || ""}
                  onChange={handleChange}
                  label="დამატებითი ინფორმაცია"
                  placeholder="მაგ: ჩიხი, სადარბაზო, სართული..."
                  error={errors.description}
                />
              </div>
            </div>
            <div className={`col-span-1 sm:col-span-3 h-[200px]`}>
              {openCreateAddressModal && (
                <Map
                  uiControl={true}
                  checkCoverageRadius={true}
                  id="location"
                  markerCoordinates={values.location || undefined}
                  centerCoordinates={helperValues.streetLocation || undefined}
                  onChange={handleChange}
                  error={errors.location}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => {
              toggleOpenCreateAddressModal();
              resetForm();
            }}
            className="cursor-pointer"
          >
            გაუქმება
          </Button>
          <Button
            onClick={handleCreateAddress}
            disabled={addAddressMutation.isPending}
            className="cursor-pointer"
          >
            {addAddressMutation.isPending && (
              <Loader2Icon className="animate-spin" />
            )}
            დამატება
          </Button>
        </div>
      </div>
    </div>
  );
}
