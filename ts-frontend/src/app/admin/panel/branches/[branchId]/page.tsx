"use client";

import { axiosAdmin, axiosFront } from "@/app/api/axios";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Button } from "@/app/components/ui/button";
import { Dropdown2 } from "@/app/components/inputs/drop-down-2";
import Map from "@/app/components/map/map";
import { useParams } from "next/navigation";

interface BranchValues {
  name: string;
  city: string;
  street: string;
  building_number: string;
  description: string;
  coverage_radius_km: string;
  delivery_price: string;
  location: LatLng | null;
}

export default function Page() {
  const { branchId } = useParams<{
    branchId: string;
  }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [values, setValues] = useState<BranchValues>({
    name: "",
    city: "",
    street: "",
    building_number: "",
    description: "",
    coverage_radius_km: "",
    delivery_price: "",
    location: null as LatLng | null,
  });

  const [errors, setErrors] = useState({
    name: "",
    city: "",
    street: "",
    building_number: "",
    description: "",
    coverage_radius_km: "",
    delivery_price: "",
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

  const [citiesData, setCitiesData] = useState<any>([]);
  const [streetsData, setStreetsData] = useState<any[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [streetLoading, setStreetLoading] = useState(false);

  const fetchBranch = () => {
    setLoading(true);
    axiosAdmin
      .get(`admin/branches/${branchId}`)
      .then((res) => {
        setValues((prev) => ({
          ...prev,
          name: res.data.name,
          city: res.data.city,
          street: res.data.street,
          building_number: res.data.building_number,
          description: res.data.description,
          coverage_radius_km: res.data.coverage_radius_km,
          delivery_price: res.data.delivery_price,
          location: res.data.location,
        }));
        setHelperValues((prev) => ({
          ...prev,
          cityLocation: res.data.location,
        }));
        setLoading(false);
      })
      .catch(() => {})
      .finally(() => {});
  };

  useEffect(() => {
    fetchBranch();
  }, [branchId]);

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

  // validation
  const branchSchema = Yup.object().shape({
    name: Yup.string().required("სახელწოდება აუცილებელია"),
    city: Yup.string().required("ქალაქი აუცილებელია"),
    street: Yup.string().required("ქუჩა აუცილებელია"),
    building_number: Yup.string().required("შენობის ნომერი აუცილებელია"),
    description: Yup.string().required("აღწერა აუცილებელია"),
    coverage_radius_km: Yup.string().required("დაფარვის რადიუსი აუცილებელია"),
    delivery_price: Yup.string().required("კურიერის გადასახადი აუცილებელია"),
    location: Yup.object()
      .shape({
        lat: Yup.number().required(),
        lng: Yup.number().required(),
      })
      .required("გთხოვთ აირჩიოთ მდებარეობა რუკაზე"),
  });

  const handleUpdateBranch = async () => {
    setLoading(true);
    try {
      await branchSchema.validate(values, { abortEarly: false });

      axiosAdmin
        .patch(`admin/branches/${branchId}`, values)
        .then(() => {
          toast.success("ფილიალი განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          fetchBranch();

          setValues((prev) => ({
            ...prev,
            name: "",
            city: "",
            street: "",
            building_number: "",
            description: "",
            coverage_radius_km: "",
            delivery_price: "",
            location: null,
          }));
          setErrors({
            name: "",
            city: "",
            street: "",
            building_number: "",
            description: "",
            coverage_radius_km: "",
            delivery_price: "",
            location: "",
          });
        })
        .catch(() => {
          setLoading(false);
          toast.error("ვერ განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });
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

  if (loading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center`}>
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-[10px] w-full max-w-2xl mx-auto">
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
          onChange={(e) => handleDropdownChange("searchCity", e.target.value)}
          onSelect={(item) => handleDropdownSelect("searchCity", item)}
          label="ქალაქი"
          isLoading={cityLoading}
          error={errors.city}
        />
        <Dropdown2
          id="searchStreet"
          data={streetsData}
          value={helperValues.searchStreet}
          onChange={(e) => handleDropdownChange("searchStreet", e.target.value)}
          onSelect={(item) => handleDropdownSelect("searchStreet", item)}
          label="ქუჩა"
          isLoading={streetLoading}
          error={errors.street}
        />
        <div className="col-span-1 sm:col-span-2 h-[200px] bg-myLightBlue rounded-[8px] overflow-hidden">
          <Map
            uiControl={true}
            id="location"
            markerCoordinates={values.location || undefined}
            centerCoordinates={
              helperValues.streetLocation ||
              helperValues.cityLocation ||
              undefined
            }
            onChange={handleChange}
          />
        </div>

        <PanelFormInput
          id="building_number"
          value={values.building_number || ""}
          onChange={handleChange}
          label="შენობის ნომერი"
          error={errors.building_number}
        />
        <PanelFormInput
          id="description"
          value={values.description || ""}
          onChange={handleChange}
          label="აღწერა"
          error={errors.description}
        />
        <PanelFormInput
          id="coverage_radius_km"
          value={values.coverage_radius_km || ""}
          onChange={handleChange}
          label="დაფარვის რადიუსი (კმ)"
          error={errors.coverage_radius_km}
        />
        <PanelFormInput
          id="delivery_price"
          value={values.delivery_price || ""}
          onChange={handleChange}
          label="კურიერის გადასახადი (კმ)"
          error={errors.delivery_price}
        />
        <div className="col-span-1 sm:col-span-2">
          <Button
            onClick={handleUpdateBranch}
            disabled={loading}
            className="h-[45px] px-6 text-white cursor-pointer flex place-self-end"
          >
            ცვლილების შენახვა
          </Button>
        </div>
      </div>
    </div>
  );
}
