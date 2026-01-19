"use client";

import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Dropdown2 } from "@/app/components/inputs/drop-down-2";
import Map from "@/app/components/map/map";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosAdmin } from "@/app/lib/api/axios";
import { fetchCities, fetchStreets } from "@/app/lib/api/locations";

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

const fetchAdminBranchById = async (branchId: string) => {
  const { data } = await axiosAdmin.get(`admin/branches/${branchId}`);
  return data;
};

export default function Page() {
  const { branchId } = useParams<{
    branchId: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: branch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["adminBranch", branchId],
    queryFn: () => fetchAdminBranchById(branchId),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      router.back();
    }
  }, [isError, router]);

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

  useEffect(() => {
    if (branch) {
      setValues((prev) => ({
        ...prev,
        name: branch.name,
        city: branch.city,
        street: branch.street,
        building_number: branch.building_number,
        description: branch.description,
        coverage_radius_km: branch.coverage_radius_km,
        delivery_price: branch.delivery_price,
        location: branch.location,
      }));
      setHelperValues((prev) => ({
        ...prev,
        cityLocation: branch.location,
        searchCity: branch.city,
        searchStreet: branch.street,
      }));
    }
  }, [branch]);

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

  // 🔹 Generic handler for dropdown (city / street)
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
      .required("მდებარეობა რუკაზე აუცილებელია"),
  });

  const updateBranchMutation = useMutation({
    mutationFn: async (payload: any) =>
      axiosAdmin.patch(`admin/branches/${branchId}`, payload),

    onSuccess: () => {
      toast.success("ფილიალი განახლდა", {
        position: "bottom-right",
        autoClose: 3000,
      });

      // refetch faq data
      queryClient.invalidateQueries({
        queryKey: ["adminBranch", branchId],
      });
      // refresh branches list
      queryClient.invalidateQueries({
        queryKey: ["adminBranches"],
      });

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
    },

    onError: () => {
      toast.error("ვერ განახლდა", {
        position: "bottom-right",
        autoClose: 3000,
      });
    },
  });

  const handleUpdateBranch = async () => {
    try {
      await branchSchema.validate(values, { abortEarly: false });

      updateBranchMutation.mutate(values);
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
            disabled={updateBranchMutation.isPending}
            className="h-[45px] px-6 text-white cursor-pointer flex place-self-end"
          >
            {updateBranchMutation.isPending && (
              <Loader2Icon className="animate-spin" />
            )}
            ცვლილების შენახვა
          </Button>
        </div>
      </div>
    </div>
  );
}
