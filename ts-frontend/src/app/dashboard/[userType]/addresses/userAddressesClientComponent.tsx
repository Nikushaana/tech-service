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
import { api } from "@/app/lib/api/axios";
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
    mutationFn: (id: number) => api.delete(`${userType}/addresses/${id}`),

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
    <div className="w-full space-y-1">
      <div className="flex items-center gap-2 justify-between">
        <h1 className="text-xl">მისამართები</h1>
        <Button
          onClick={() => toggleOpenCreateAddressModal(userType)}
          className={`cursor-pointer`}
        >
          დამატება
        </Button>
      </div>

      <LinearLoader isLoading={isFetching} />

      <div className="overflow-x-auto w-full">
        <Table className="min-w-[900px] table-auto">
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableHead>ID</TableHead>
              <TableHead>მდებარეობა</TableHead>
              <TableHead>მისამართის სახელი</TableHead>
              <TableHead>ქალაქი</TableHead>
              <TableHead>ქუჩა</TableHead>
              <TableHead>შენობის ნომერი</TableHead>
              <TableHead>სადარბაზოს ნომერი</TableHead>
              <TableHead>სართული</TableHead>
              <TableHead>ბინის ნომერი</TableHead>
              <TableHead>აღწერა</TableHead>
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
                <TableRow key={address.id} className="hover:bg-gray-100">
                  <TableCell>{address.id}</TableCell>
                  <TableCell>
                    <div className="h-[80px] aspect-video">
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
                      className="bg-red-600 hover:bg-red-700 text-white cursor-pointer rounded-lg"
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
                        <AiOutlineDelete className="size-4"/>
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
  );
}
