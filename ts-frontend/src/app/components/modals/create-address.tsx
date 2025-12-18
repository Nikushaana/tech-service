"use client";

import React, { useEffect, useState } from "react";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PanelFormInput from "../inputs/panel-form-input";
import { Loader2Icon } from "lucide-react";
import Map from "../map/map";
import { Dropdown2 } from "../inputs/drop-down-2";
import { axiosFront } from "@/app/api/axios";
import { Button } from "@/components/ui/button";

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

  const [loading, setLoading] = useState(false);
  const [citiesData, setCitiesData] = useState<any>([]);
  const [streetsData, setStreetsData] = useState<any[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [streetLoading, setStreetLoading] = useState(false);

  /** FETCH CITY SUGGESTIONS **/
  useEffect(() => {
    if (helperValues.isSelectingCity) return;

    const delayDebounce = setTimeout(async () => {
      if (helperValues.searchCity.length >= 2) {
        try {
          setCityLoading(true);
          const res = await axiosFront.get(
            `google-api/cities?city=${helperValues.searchCity}`
          );
          setCitiesData(res.data || []);
        } catch (err) {
          toast.error("ქალაქები ვერ მოიძებნა");
        } finally {
          setCityLoading(false);
        }
      } else {
        setCitiesData([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [helperValues.searchCity, helperValues.isSelectingCity]);

  /** FETCH STREET SUGGESTIONS **/
  useEffect(() => {
    if (helperValues.isSelectingStreet || !values.city) return;

    const delayDebounce = setTimeout(async () => {
      if (helperValues.searchStreet.length >= 2) {
        try {
          setStreetLoading(true);
          const res = await axiosFront.get(
            `google-api/streets?city=${values.city}&street=${helperValues.searchStreet}`
          );
          setStreetsData(res.data || []);
        } catch (err) {
          toast.error("ქუჩები ვერ მოიძებნა");
        } finally {
          setStreetLoading(false);
        }
      } else {
        setStreetsData([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [helperValues.searchStreet, helperValues.isSelectingStreet, values.city]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    if (id === "location" && typeof value === "object") {
      setValues((prev) => ({ ...prev, location: value as LatLng }));
      return;
    }

    setValues((prev) => ({ ...prev, [id]: value }));
  };

  // --- Helper Handlers ---

  // 🔹 Generic handler for dropdown (city / street)
  const handleDropdownChange = (
    key: "searchCity" | "searchStreet",
    value: string
  ) => {
    setHelperValues((prev) => ({
      ...prev,
      [key]: value,
      [`isSelecting${key === "searchCity" ? "City" : "Street"}`]: false,
    }));

    // Reset form value (city/street) when typing
    setValues((prev) => ({
      ...prev,
      [key === "searchCity" ? "city" : "street"]: "",
    }));
  };

  // 🔹 Generic handler for selecting dropdown item
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

  const createAddressSchema = Yup.object().shape({
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
      .required("გთხოვთ აირჩიოთ მდებარეობა რუკაზე"),
  });

  const handleCreateAddress = async () => {
    setLoading(true);
    try {
      await createAddressSchema.validate(values, { abortEarly: false });
      await createAddress(modalType!, values);
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

      setCitiesData([]);
      setStreetsData([]);

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
    document.body.style.overflow = openCreateAddressModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openCreateAddressModal]);

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
        onClick={() => toggleOpenCreateAddressModal()}
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
