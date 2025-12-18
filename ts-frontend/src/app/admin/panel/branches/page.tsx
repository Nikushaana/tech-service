"use client";

import { axiosAdmin, axiosFront } from "@/app/api/axios";
import { Dropdown2 } from "@/app/components/inputs/drop-down-2";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import Map from "@/app/components/map/map";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BsEye } from "react-icons/bs";
import { toast } from "react-toastify";
import * as Yup from "yup";

export default function Page() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBranches = () => {
    setLoading(true);
    axiosAdmin
      .get("admin/branches")
      .then(({ data }) => setBranches(data))
      .catch((err) => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const [values, setValues] = useState({
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

  // add branch
  const handleAddBranch = async () => {
    setLoading(true);
    try {
      await branchSchema.validate(values, { abortEarly: false });

      axiosAdmin
        .post(`admin/create-branch`, values)
        .then(() => {
          toast.success("ფილიალი დაემატა", {
            position: "bottom-right",
            autoClose: 3000,
          });
          fetchBranches();
          setValues({
            name: "",
            city: "",
            street: "",
            building_number: "",
            description: "",
            coverage_radius_km: "",
            delivery_price: "",
            location: null,
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
          setHelperValues((prev) => ({
            ...prev,
            searchCity: "",
            searchStreet: "",
          }));
        })
        .catch(() => {
          toast.error("ვერ დაემატა", {
            position: "bottom-right",
            autoClose: 3000,
          });
          setLoading(false);
        })
        .finally(() => {});
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

  // delete branch
  const handleDeleteBranch = async (id: number) => {
    setLoading(true);
    axiosAdmin
      .delete(`admin/branches/${id}`)
      .then(() => {
        toast.success("ფილიალი წაიშალა", {
          position: "bottom-right",
          autoClose: 3000,
        });
        fetchBranches();
      })
      .catch(() => {
        toast.error("ვერ წაიშალა", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setLoading(false);
      })
      .finally(() => {});
  };

  if (loading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-y-[20px] w-full">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-[10px] w-full max-w-2xl mx-auto">
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
            onClick={handleAddBranch}
            disabled={loading}
            className="h-[45px] px-6 text-white cursor-pointer flex place-self-end"
          >
            {loading && <Loader2Icon className="animate-spin mr-2" />}
            დამატება
          </Button>
        </div>
      </div>

      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">ფილიალები</h2>
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[900px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">სახელი</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((branch) => (
                  <TableRow key={branch.id} className="hover:bg-gray-50">
                    <TableCell>{branch.id}</TableCell>
                    <TableCell>{branch.name}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/panel/branches/${branch.id}`}>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          <BsEye className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          handleDeleteBranch(branch.id);
                        }}
                        variant="secondary"
                        size="icon"
                        className="bg-[red] hover:bg-[#b91c1c] ml-3 cursor-pointer"
                      >
                        <AiOutlineDelete className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
