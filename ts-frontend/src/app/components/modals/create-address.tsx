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
import { fetchCities, fetchStreets } from "@/app/lib/api/locations";
import { axiosCompany, axiosIndividual } from "@/app/lib/api/axios";

export default function CreateAddress() {
  const { openCreateAddressModal, toggleOpenCreateAddressModal, modalType } =
    useAddressesStore();

  const queryClient = useQueryClient();

  const [values, setValues] = useState({
    name: "",
    city: "",
    street: "",
    building_number: "",
    building_entrance: "",
    building_floor: "",
    apartment_number: "",
    description: "",
    location: null as LatLng | null,
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
    location: "",
  });

  const [helperValues, setHelperValues] = useState({
    searchCity: "",
    searchStreet: "",
    cityLocation: null as LatLng | null,
    streetLocation: null as LatLng | null,
    isSelectingCity: false,
    isSelectingStreet: false,
  });

  const { data: citiesData = [], isLoading: cityLoading } = useQuery({
    queryKey: ["cities", helperValues.searchCity],
    queryFn: () => fetchCities(helperValues.searchCity),
    enabled:
      !helperValues.isSelectingCity && helperValues.searchCity.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  const { data: streetsData = [], isLoading: streetLoading } = useQuery({
    queryKey: ["streets", values.city, helperValues.searchStreet],
    queryFn: () => fetchStreets(values.city, helperValues.searchStreet),
    enabled:
      !helperValues.isSelectingStreet &&
      !!values.city &&
      helperValues.searchStreet.length >= 2,
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

  // Generic handler for dropdown (city / street)
  const handleDropdownChange = (
    key: "searchCity" | "searchStreet",
    value: string
  ) => {
    setHelperValues((prev) => ({
      ...prev,
      [key]: value,
      [`isSelecting${key === "searchCity" ? "City" : "Street"}`]: false,
      ...(key === "searchCity" && {
        searchStreet: "",
      }),
    }));

    // Reset form value (city/street) when typing
    setValues((prev) => ({
      ...prev,
      ...(key === "searchCity" && {
        city: value,
        street: "",
      }),
      ...(key === "searchStreet" && {
        street: value,
      }),
      location: null,
    }));
  };

  // Generic handler for selecting dropdown item
  const handleDropdownSelect = (
    key: "searchCity" | "searchStreet",
    item: any
  ) => {
    setValues((prev) => ({
      ...prev,
      [key === "searchCity" ? "city" : "street"]: item.name,
    }));

    setHelperValues((prev) => ({
      ...prev,
      [key]: item.name,
      [`${key === "searchCity" ? "cityLocation" : "streetLocation"}`]:
        item.location,
      [`isSelecting${key === "searchCity" ? "City" : "Street"}`]: true,
    }));
  };

  const addressSchema = Yup.object().shape({
    name: Yup.string().required("სახელწოდება აუცილებელია"),
    city: Yup.string().required("ქალაქი აუცილებელია"),
    street: Yup.string().required("ქუჩა აუცილებელია"),
    building_number: Yup.string().required("შენობის ნომერი აუცილებელია"),
    description: Yup.string().required("აღწერა აუცილებელია"),
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
      city: string;
      street: string;
      building_number: string;
      building_entrance?: string;
      building_floor?: string;
      apartment_number?: string;
      description: string;
      location: LatLng | null;
    }) =>
      (modalType === "company" ? axiosCompany : axiosIndividual).post(
        `${modalType}/create-address`,
        payload
      ),

    onSuccess: () => {
      toast.success("მისამართი დაემატა");

      // refresh addresses list
      queryClient.invalidateQueries({
        queryKey: ["userAddresses"],
      });

      toggleOpenCreateAddressModal();

      // reset form
      setValues({
        name: "",
        city: "",
        street: "",
        building_number: "",
        building_entrance: "",
        building_floor: "",
        apartment_number: "",
        description: "",
        location: null,
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
        location: "",
      });
      setHelperValues({
        searchCity: "",
        searchStreet: "",
        cityLocation: null,
        streetLocation: null,
        isSelectingCity: false,
        isSelectingStreet: false,
      });
    },

    onError: () => {
      toast.error("მისამართი ვერ დაემატა");
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
          setValues({
            name: "",
            city: "",
            street: "",
            building_number: "",
            building_entrance: "",
            building_floor: "",
            apartment_number: "",
            description: "",
            location: null,
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
            location: "",
          });
          setHelperValues({
            searchCity: "",
            searchStreet: "",
            cityLocation: null,
            streetLocation: null,
            isSelectingCity: false,
            isSelectingStreet: false,
          });
        }}
      ></div>

      <div
        className={`bg-white rounded-2xl shadow-lg py-6 px-3 w-full sm:w-[600px] mx-[10px] z-[22] transition-transform duration-200 flex flex-col gap-y-[10px] max-h-[90vh] ${
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
            <Dropdown2
              id="searchCity"
              data={citiesData}
              value={helperValues.searchCity}
              onChange={(e) =>
                handleDropdownChange("searchCity", e.target.value)
              }
              onSelect={(item) => handleDropdownSelect("searchCity", item)}
              label="ქალაქი"
              isLoading={cityLoading}
              error={errors.city}
            />
            <Dropdown2
              id="searchStreet"
              data={streetsData}
              value={helperValues.searchStreet}
              onChange={(e) =>
                handleDropdownChange("searchStreet", e.target.value)
              }
              onSelect={(item) => handleDropdownSelect("searchStreet", item)}
              label="ქუჩა"
              isLoading={streetLoading}
              error={errors.street}
            />
            <div className="col-span-1 sm:col-span-2 h-[200px] bg-myLightBlue rounded-[8px] overflow-hidden">
              {openCreateAddressModal && (
                <Map
                  uiControl={true}
                  checkCoverageRadius={true}
                  id="location"
                  markerCoordinates={values.location || undefined}
                  centerCoordinates={
                    helperValues.streetLocation ||
                    helperValues.cityLocation ||
                    undefined
                  }
                  onChange={handleChange}
                />
              )}
            </div>

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
              label="სადარბაზოს ნომერი"
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

              setValues({
                name: "",
                city: "",
                street: "",
                building_number: "",
                building_entrance: "",
                building_floor: "",
                apartment_number: "",
                description: "",
                location: null,
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
                location: "",
              });
              setHelperValues({
                searchCity: "",
                searchStreet: "",
                cityLocation: null,
                streetLocation: null,
                isSelectingCity: false,
                isSelectingStreet: false,
              });
            }}
            className="h-[45px] px-6 cursor-pointer bg-red-500 hover:bg-[#b91c1c]"
          >
            გაუქმება
          </Button>
          <Button
            onClick={handleCreateAddress}
            disabled={addAddressMutation.isPending}
            className="h-[45px] px-6 text-white cursor-pointer"
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
