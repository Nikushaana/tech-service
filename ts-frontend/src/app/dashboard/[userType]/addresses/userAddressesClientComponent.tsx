"use client";

import Map from "@/app/components/map/map";
import { Button } from "@/components/ui/button";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import { Loader2Icon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { AiOutlineDelete } from "react-icons/ai";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { fetchUserAddresses } from "@/app/lib/api/userAddresses";
import { axiosCompany, axiosIndividual } from "@/app/lib/api/axios";
import Pagination from "@/app/components/pagination/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LinearLoader from "@/app/components/linearLoader";

export default function UserAddressesClientComponent() {
  const { userType } = useParams<{
    userType: "company" | "individual";
  }>();

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const queryClient = useQueryClient();

  const { toggleOpenCreateAddressModal } = useAddressesStore();

  const { data: addresses, isFetching } = useQuery({
    queryKey: ["userAddresses", userType, page],
    queryFn: () => fetchUserAddresses(userType, page),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  // delete address
  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) =>
      (userType === "company" ? axiosCompany : axiosIndividual).delete(
        `${userType}/addresses/${id}`,
      ),

    onSuccess: () => {
      toast.success("მისამართი წაიშალა");

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
        );
      } else {
        toast.error("მისამართი ვერ წაიშალა");
      }
    },
  });

  const handleDeleteAddress = (id: number) => {
    deleteAddressMutation.mutate(id);
  };

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

      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-2">
        <h2 className="text-xl font-semibold mb-2">მისამართები</h2>

        <div className="flex justify-end">
          <Pagination totalPages={addresses?.totalPages} currentPage={page} />
        </div>

        <LinearLoader isLoading={isFetching} />

        <div className="overflow-x-auto w-full">
          <Table className="min-w-[900px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">მდებარეობა</TableHead>
                <TableHead className="font-semibold">
                  მისამართის სახელი
                </TableHead>
                <TableHead className="font-semibold">ქალაქი</TableHead>
                <TableHead className="font-semibold">ქუჩა</TableHead>
                <TableHead className="font-semibold">შენობის ნომერი</TableHead>
                <TableHead className="font-semibold">
                  სადარბაზოს ნომერი
                </TableHead>
                <TableHead className="font-semibold">სართული</TableHead>
                <TableHead className="font-semibold">ბინის ნომერი</TableHead>
                <TableHead className="font-semibold">აღწერა</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!addresses ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია იძებნება...
                  </TableCell>
                </TableRow>
              ) : addresses?.total === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                addresses?.data?.map((address: any) => (
                  <TableRow key={address.id} className="hover:bg-gray-50">
                    <TableCell>{address.id}</TableCell>
                    <TableCell>
                      <div className="h-[80px] aspect-video bg-myLightBlue rounded-[8px] overflow-hidden">
                        <Map
                          centerCoordinates={address.location}
                          markerCoordinates={address.location}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{address.name}</TableCell>
                    <TableCell>{address.city}</TableCell>
                    <TableCell>{address.street}</TableCell>
                    <TableCell>{address.building_number}</TableCell>
                    <TableCell>{address.building_entrance || "---"}</TableCell>
                    <TableCell>{address.building_floor || "---"}</TableCell>
                    <TableCell>{address.apartment_number || "---"}</TableCell>
                    <TableCell>{address.description}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-[red] hover:bg-[#b91c1c] cursor-pointer"
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={
                          deleteAddressMutation.isPending &&
                          deleteAddressMutation.variables === address.id
                        }
                      >
                        {deleteAddressMutation.isPending &&
                        deleteAddressMutation.variables === address.id ? (
                          <Loader2Icon className="animate-spin" />
                        ) : (
                          <AiOutlineDelete />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <Pagination totalPages={addresses?.totalPages} currentPage={page} />
        </div>
      </div>
    </div>
  );
}
