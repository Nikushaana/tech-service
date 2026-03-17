"use client";

import { Button } from "@/components/ui/button";
import { useOrdersStore } from "@/app/store/useOrdersStore";
import dayjs from "dayjs";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BsEye } from "react-icons/bs";
import { CiFilter } from "react-icons/ci";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { statusLabels, typeLabels } from "@/app/utils/order-type-status-translations";
import { api } from "@/app/lib/api/axios";
import Pagination from "@/app/components/pagination/pagination";
import LinearLoader from "@/app/components/linearLoader";
import { useOrderTypeStatusOptionsStore } from "@/app/store/orderTypeStatusOptionsStore";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

const fetchUserOrders = async (
  userType: ClientRole,
  page: number,
  service_type: string,
  search: string,
  from: string,
  to: string,
) => {
  const params = new URLSearchParams();

  if (page) params.set("page", page.toString());
  if (service_type) params.set("service_type", service_type);
  if (search) params.set("search", search);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const { data } = await api.get(`${userType}/orders?${params.toString()}`);
  return data;
};

export default function UserOrdersClientComponent() {
  const { userType } = useParams<{
    userType: ClientRole;
  }>();

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const service_type = searchParams.get("service_type") || "";
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const { typeOptions } = useOrderTypeStatusOptionsStore();
  const serviceTypeFilters = [{ id: "", name: "ყველა" }, ...typeOptions];

  const { data: orders, isFetching } = useQuery({
    queryKey: ["userOrders", userType, page, service_type, search, from, to],
    queryFn: () =>
      fetchUserOrders(userType, page, service_type, search, from, to),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  const { data: currentUser } = useCurrentUser();
  const { toggleOpenCreateOrderModal, toggleOpenFilterOrderModal } =
    useOrdersStore();

  // change filter service_type
  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("service_type", value);
    } else {
      params.delete("service_type");
    }

    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const countFilter = [service_type, search, from].filter(Boolean).length;

  return (
    <div className="w-full space-y-1">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
        <h1 className="text-xl">ჩემი განცხადებები</h1>
        <div className="flex gap-2 self-end">
          <Button
            onClick={toggleOpenFilterOrderModal}
            variant="outline"
            className="cursor-pointer"
          >
            <CiFilter className="size-4" />{" "}
            <p className="hidden sm:flex">
              ფილტრი {countFilter !== 0 && `(${countFilter})`}
            </p>
          </Button>
          <Button
            onClick={() => {
              if (currentUser?.status) {
                toggleOpenCreateOrderModal(userType);
              } else {
                toast.error(
                  "თქვენ ვერ დაამატებთ შეკვეთას, რადგან თქვენი პროფილი გასააქტიურებელია",
                );
              }
            }}
            className={`md:hidden cursor-pointer`}
          >
            შეავსე განაცხადი
          </Button>
        </div>
      </div>

      <div className="flex items-center overflow-x-auto">
        {serviceTypeFilters.map((type) => {
          const isActive = service_type === type.id;

          return (
            <button
              key={type.id || "all"}
              onClick={() => handleChange(type.id)}
              className={`px-2 sm:px-4 py-1.5 text-[13px] cursor-pointer duration-100 border-b-1 shrink-0
        ${
          isActive
            ? "text-myLightBlue border-b-myLightBlue"
            : "hover:text-myLightBlue border-b-transparent hover:border-b-myLightBlue"
        }`}
            >
              {type.name}
            </button>
          );
        })}
      </div>

      <LinearLoader isLoading={isFetching} />

      <div className="overflow-x-auto w-full">
        <Table className="min-w-[900px] table-auto">
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableHead>ID</TableHead>
              <TableHead>ტიპი</TableHead>
              <TableHead>კატეგორია</TableHead>
              <TableHead>ბრენდი</TableHead>
              <TableHead>მოდელი</TableHead>
              <TableHead>სტატუსი</TableHead>
              <TableHead>დამატების თარიღი</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!orders ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია იძებნება...
                </TableCell>
              </TableRow>
            ) : orders?.total === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია არ მოიძებნა
                </TableCell>
              </TableRow>
            ) : (
              orders?.data?.map((order: Order) => (
                <TableRow key={order.id} className="hover:bg-gray-100">
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{typeLabels[order.service_type] || order.service_type}</TableCell>
                  <TableCell>{order.category.name}</TableCell>
                  <TableCell>{order.brand}</TableCell>
                  <TableCell>{order.model}</TableCell>
                  <TableCell>
                    {statusLabels[order.status] || order.status}
                  </TableCell>
                  <TableCell>
                    {dayjs(order.created_at).format("DD.MM.YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/${userType}/orders/${order.id}`}>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-myLightBlue hover:bg-myBlue text-white cursor-pointer rounded-lg"
                      >
                        <BsEye className="size-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Pagination totalPages={orders?.totalPages} currentPage={page} />
      </div>
    </div>
  );
}
