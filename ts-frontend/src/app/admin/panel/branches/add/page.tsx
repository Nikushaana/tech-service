"use client";

import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { useState } from "react";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dropdown2 } from "@/app/components/inputs/drop-down-2";
import Map from "@/app/components/map/map";
import { Loader2Icon } from "lucide-react";
import { fetchStreets } from "@/app/lib/api/locations";
import { formatNumber } from "@/app/utils/formatNumber";
import { api } from "@/app/lib/api/axios";

const initialValues = {
  name: "",
  street: "",
  building_number: "",
  description: "",
  coverage_radius_km: "",
  fix_off_site_price: "",
  installation_price: "",
  fix_on_site_price: "",
  location: null as LatLng | null,
};

const initialErrors = {
  name: "",
  street: "",
  building_number: "",
  description: "",
  coverage_radius_km: "",
  fix_off_site_price: "",
  installation_price: "",
  fix_on_site_price: "",
  location: "",
};

const initialHelperValues = {
  searchStreet: "",
  streetLocation: null as LatLng | null,
  isSelectingStreet: false,
};

export default function Page() {
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

    setValues((prev) => ({
      ...prev,
      [id]:
        id == "coverage_radius_km" ||
        id == "fix_off_site_price" ||
        id == "installation_price" ||
        id == "fix_on_site_price"
          ? formatNumber(value)
          : value,
    }));
  };

  const handleDropdownChange = (value: string) => {
    setHelperValues((prev) => ({
      ...prev,
      searchStreet: value,
      isSelectingStreet: false,
    }));

    setValues((prev) => ({
      ...prev,
      street: value,
      location: null,
    }));
  };

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

  // validation
  const branchSchema = Yup.object().shape({
    name: Yup.string().required("სახელწოდება აუცილებელია"),
    street: Yup.string().required("ქუჩა აუცილებელია"),
    building_number: Yup.string().required("შენობის ნომერი აუცილებელია"),
    description: Yup.string().required("აღწერა აუცილებელია"),
    coverage_radius_km: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : Number(originalValue),
      )
      .typeError("დაფარვის რადიუსი უნდა იყოს რიცხვი")
      .moreThan(0, "დაფარვის რადიუსი უნდა იყოს 0-ზე მეტი")
      .required("დაფარვის რადიუსი აუცილებელია"),
    fix_off_site_price: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : Number(originalValue),
      )
      .typeError("ფასი უნდა იყოს რიცხვი")
      .required("სერვისცენტრში შეკეთების გამოძახების ფასი აუცილებელია"),

    installation_price: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : Number(originalValue),
      )
      .typeError("ფასი უნდა იყოს რიცხვი")
      .required("მონტაჟის გამოძახების ფასი აუცილებელია"),

    fix_on_site_price: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : Number(originalValue),
      )
      .typeError("ფასი უნდა იყოს რიცხვი")
      .required("ადგილზე შეკეთების გამოძახების ფასი აუცილებელია"),
    location: Yup.object()
      .shape({
        lat: Yup.number().required(),
        lng: Yup.number().required(),
      })
      .required("მდებარეობა რუკაზე აუცილებელია"),
  });

  //add branch
  const addBranchMutation = useMutation({
    mutationFn: (payload: BranchValues) =>
      api.post("admin/create-branch", {
        ...payload,
        coverage_radius_km: parseFloat(values.coverage_radius_km),
        fix_off_site_price: parseFloat(values.fix_off_site_price),
        installation_price: parseFloat(values.installation_price),
        fix_on_site_price: parseFloat(values.fix_on_site_price),
      }),

    onSuccess: () => {
      toast.success("ფილიალი დაემატა");

      resetForm();

      // refresh branches list
      queryClient.invalidateQueries({
        queryKey: ["adminBranches"],
      });
      queryClient.invalidateQueries({
        queryKey: ["frontBranches"],
      });
    },

    onError: () => {
      toast.error("ვერ დაემატა");
    },
  });

  const handleAddBranch = async () => {
    try {
      await branchSchema.validate(values, { abortEarly: false });

      addBranchMutation.mutate(values);
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
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 w-full max-w-2xl mx-auto space-y-2">
      <PanelFormInput
        id="name"
        value={values.name || ""}
        onChange={handleChange}
        label="მისამართის სახელი"
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
          isLoading={streetLoading}
          error={errors.street}
        />
        <PanelFormInput
          id="building_number"
          value={values.building_number || ""}
          onChange={handleChange}
          label="შენობის ნომერი"
          error={errors.building_number}
        />
      </div>
      <PanelFormInput
        id="description"
        value={values.description || ""}
        onChange={handleChange}
        label="აღწერა"
        error={errors.description}
      />
      <div className={`h-[200px]`}>
        <Map
          uiControl={true}
          id="location"
          markerCoordinates={values.location || undefined}
          centerCoordinates={helperValues.streetLocation || undefined}
          onChange={handleChange}
          error={errors.location}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <PanelFormInput
          id="coverage_radius_km"
          value={values.coverage_radius_km}
          onChange={handleChange}
          label="დაფარვის რადიუსი (კმ)"
          type="tel"
          error={errors.coverage_radius_km}
        />
        <PanelFormInput
          id="fix_off_site_price"
          value={values.fix_off_site_price}
          onChange={handleChange}
          label="სერვ-ში შეკეთების გამოძახების ფასი"
          type="tel"
          error={errors.fix_off_site_price}
        />
        <PanelFormInput
          id="installation_price"
          value={values.installation_price}
          onChange={handleChange}
          label="მონტაჟის გამოძახების ფასი"
          type="tel"
          error={errors.installation_price}
        />
        <PanelFormInput
          id="fix_on_site_price"
          value={values.fix_on_site_price}
          onChange={handleChange}
          label="ადგილზე შეკეთების გამოძახების ფასი"
          type="tel"
          error={errors.fix_on_site_price}
        />
      </div>
      <div className="col-span-1 sm:col-span-2">
        <Button
          onClick={handleAddBranch}
          disabled={addBranchMutation.isPending}
          className="h-[45px] px-6 text-white cursor-pointer flex place-self-end"
        >
          {addBranchMutation.isPending && (
            <Loader2Icon className="animate-spin" />
          )}
          დამატება
        </Button>
      </div>
    </div>
  );
}
