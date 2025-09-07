"use client";

import { Button } from "@/app/components/ui/button";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import { Loader2Icon } from "lucide-react";
import React, { useEffect } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { LuPlus } from "react-icons/lu";
import { PiMapPinFill } from "react-icons/pi";

interface PageProps {
  params: Promise<{
    userType: "company" | "individual";
  }>;
}

export default function Page({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { userType } = resolvedParams;

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
  
  return (
    <div
      className={`w-full flex flex-col gap-y-[30px] items-center ${
        (loading || addresses.length == 0) && "justify-center"
      }`}
    >
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <>
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
              className={`${
                addresses.length > 0 ? "text-[18px]" : "text-[22px]"
              }`}
            />{" "}
            მისამართის დამატება
          </Button>

          {addresses.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-[20px] max-w-[400px] lg:max-w-none w-full lg:w-auto items-stretch">
              {addresses.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-transform duration-200 h-full lg:max-w-[400px] lg:w-full transform hover:-translate-y-1 rounded-xl p-[14px] flex flex-col gap-2"
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

                  <p>
                    {item.city}, {item.street}
                  </p>
                  <p>შენობის ნომერი: {item.building_number}</p>
                  {item.building_entrance && (
                    <p>სადარბაზოს ნომერი: {item.building_entrance}</p>
                  )}
                  {item.building_floor && <p>სართული: {item.building_floor}</p>}
                  {item.apartment_number && (
                    <p>ბინის ნომერი: {item.apartment_number}</p>
                  )}
                  <p className="flex-1 p-[5px] bg-gray-100 rounded-[8px]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
