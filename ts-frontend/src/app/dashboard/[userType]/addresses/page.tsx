"use client";

import Map from "@/app/components/map/map";
import { Button } from "@/components/ui/button";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import { Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { AiOutlineDelete } from "react-icons/ai";
import { PiMapPinFill } from "react-icons/pi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { fetchUserAddresses } from "@/app/lib/api/userAddresses";
import { axiosCompany, axiosIndividual } from "@/app/lib/api/axios";

export default function Page() {
  const { userType } = useParams<{
    userType: "company" | "individual";
  }>();

  const queryClient = useQueryClient();

  const { toggleOpenCreateAddressModal } = useAddressesStore();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["userAddresses", userType],
    queryFn: () => fetchUserAddresses(userType),
    staleTime: 1000 * 60 * 10,
  });

  // delete address
  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) =>
      (userType === "company" ? axiosCompany : axiosIndividual).delete(
        `${userType}/addresses/${id}`
      ),

    onSuccess: () => {
      toast.success("მისამართი წაიშალა", {
        position: "bottom-right",
        autoClose: 3000,
      });

      queryClient.invalidateQueries({
        queryKey: ["userAddresses"],
      });
    },

    onError: (error: any) => {
      if (
        error.response?.data?.message ===
        "Address cannot be deleted because it is used in an order"
      ) {
        toast.error(
          "მისამართი ვერ წაიშლება, რადგან გამოყენებულია ერთ-ერთ შეკვეთაში",
          { position: "bottom-right", autoClose: 3000 }
        );
      } else {
        toast.error("მისამართი ვერ წაიშალა", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    },
  });

  const handleDeleteAddress = (id: number) => {
    deleteAddressMutation.mutate(id);
  };

  if (isLoading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className={`w-full flex flex-col gap-y-2`}>
      <div className="self-end">
        <Button
          onClick={() => toggleOpenCreateAddressModal(userType)}
          className={`cursor-pointer h-[40px]`}
        >
          მისამართის დამატება
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-[20px] w-full items-stretch">
        {addresses.map((address: Address) => (
          <div
            key={address.id}
            className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-transform duration-200 h-full w-full transform hover:-translate-y-1 rounded-xl p-[14px] flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <div className="w-[45px] aspect-square rounded-full bg-gray-100 text-myLightBlue text-[24px] flex items-center justify-center">
                  <PiMapPinFill />
                </div>
                <h2 className="text-[20px]">{address.name}</h2>
              </div>
              <Button
                onClick={() => handleDeleteAddress(address.id)}
                disabled={
                  deleteAddressMutation.isPending &&
                  deleteAddressMutation.variables === address.id
                }
                className="bg-[red] hover:bg-[#b91c1c] text-[20px] cursor-pointer"
              >
                {deleteAddressMutation.isPending &&
                deleteAddressMutation.variables === address.id ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <AiOutlineDelete />
                )}
              </Button>
            </div>

            <p className="text-sm">
              ქალაქი:{" "}
              <span className="text-base font-semibold">{address.city}</span>
            </p>
            <p className="text-sm">
              ქუჩა:{" "}
              <span className="text-base font-semibold">{address.street}</span>
            </p>
            <p className="text-sm">
              შენობის ნომერი:{" "}
              <span className="text-base font-semibold">
                {address.building_number}
              </span>
            </p>
            {address.building_entrance && (
              <p className="text-sm">
                სადარბაზოს ნომერი:{" "}
                <span className="text-base font-semibold">
                  {address.building_entrance}
                </span>
              </p>
            )}
            {address.building_floor && (
              <p className="text-sm">
                სართული:{" "}
                <span className="text-base font-semibold">
                  {address.building_floor}
                </span>
              </p>
            )}
            {address.apartment_number && (
              <p className="text-sm">
                ბინის ნომერი:{" "}
                <span className="text-base font-semibold">
                  {address.apartment_number}
                </span>
              </p>
            )}
            <p className="flex-1 p-[5px] bg-gray-100 rounded-[8px]">
              {address.description}
            </p>
            <div className="h-[100px] bg-myLightBlue rounded-[8px] overflow-hidden">
              <Map
                centerCoordinates={address.location}
                markerCoordinates={address.location}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
