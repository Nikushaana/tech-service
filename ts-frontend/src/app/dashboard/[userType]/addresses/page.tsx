"use client";

import Map from "@/app/components/map/map";
import { Button } from "@/app/components/ui/button";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import { Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { LuPlus } from "react-icons/lu";
import { PiMapPinFill } from "react-icons/pi";

export default function Page() {
  const { userType } = useParams<{
    userType: "company" | "individual";
  }>();

  const {
    addresses,
    fetchAddresses,
    toggleOpenCreateAddressModal,
    loadingDelete,
    deleteAddress,
    loading,
  } = useAddressesStore();

  useEffect(() => {
    fetchAddresses(userType); // fetch correct type on mount
  }, [userType]);

  if (loading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div
      className={`w-full flex flex-col gap-y-[30px] items-center ${
        addresses.length == 0 && "justify-center"
      }`}
    >
      {addresses.length == 0 && (
        <p className="text-2xl font-semibold text-myLightGray text-center">
          მისამართი ჯერ არ გაქვს დამატებული
        </p>
      )}
      <Button
        onClick={() => toggleOpenCreateAddressModal(userType)}
        className={`cursor-pointer ${
          addresses.length > 0 ? "h-[40px]" : "text-lg h-[50px]"
        }`}
      >
        <LuPlus
          className={`${addresses.length > 0 ? "text-[18px]" : "text-[22px]"}`}
        />{" "}
        მისამართის დამატება
      </Button>

      {addresses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-[20px] w-full items-stretch">
          {addresses.map((item: Address) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-transform duration-200 h-full w-full transform hover:-translate-y-1 rounded-xl p-[14px] flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[10px]">
                  <div className="w-[45px] aspect-square rounded-full bg-gray-100 text-myLightBlue text-[24px] flex items-center justify-center">
                    <PiMapPinFill />
                  </div>
                  <h2 className="text-[20px]">{item.name}</h2>
                </div>
                <Button
                  onClick={() => deleteAddress(userType, item.id)}
                  disabled={loadingDelete == item.id}
                  className="bg-[red] hover:bg-[#b91c1c] text-[20px] cursor-pointer"
                >
                  {loadingDelete == item.id ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <AiOutlineDelete />
                  )}
                </Button>
              </div>

              <p className="text-sm">
                ქალაქი:{" "}
                <span className="text-base font-semibold">{item.city}</span>
              </p>
              <p className="text-sm">
                ქუჩა:{" "}
                <span className="text-base font-semibold">{item.street}</span>
              </p>
              <p className="text-sm">
                შენობის ნომერი:{" "}
                <span className="text-base font-semibold">
                  {item.building_number}
                </span>
              </p>
              {item.building_entrance && (
                <p className="text-sm">
                  სადარბაზოს ნომერი:{" "}
                  <span className="text-base font-semibold">
                    {item.building_entrance}
                  </span>
                </p>
              )}
              {item.building_floor && (
                <p className="text-sm">
                  სართული:{" "}
                  <span className="text-base font-semibold">
                    {item.building_floor}
                  </span>
                </p>
              )}
              {item.apartment_number && (
                <p className="text-sm">
                  ბინის ნომერი:{" "}
                  <span className="text-base font-semibold">
                    {item.apartment_number}
                  </span>
                </p>
              )}
              <p className="flex-1 p-[5px] bg-gray-100 rounded-[8px]">
                {item.description}
              </p>
              <div className="h-[100px] bg-myLightBlue rounded-[8px] overflow-hidden">
                <Map
                  centerCoordinates={item.location}
                  markerCoordinates={item.location}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
