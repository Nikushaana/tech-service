"use client";

import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { BsEye } from "react-icons/bs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import {
  statusLabels,
  typeLabels,
} from "@/app/utils/order-type-status-translations";
import { axiosDelivery, axiosTechnician } from "@/app/lib/api/axios";
import Pagination from "@/app/components/pagination/pagination";
import LinearLoader from "@/app/components/linearLoader";

const fetchStaffOrders = async (page: number, staffType: StaffRole) => {
  const api = staffType === "technician" ? axiosTechnician : axiosDelivery;
  const { data } = await api.get(`${staffType}/orders?page=${page}`);
  return data;
};

export default function StaffOrdersClientComponent() {
  const { staffType } = useParams<{ staffType: StaffRole }>();

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data: orders, isFetching } = useQuery({
    queryKey: ["staffOrders", page],
    queryFn: () => fetchStaffOrders(page, staffType),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-2">
      <h2 className="text-xl font-semibold mb-2">ჩემი სერვისები</h2>

      <div className="flex justify-end">
        <Pagination totalPages={orders?.totalPages} currentPage={page} />
      </div>

      <LinearLoader isLoading={isFetching} />

      <div className="overflow-x-auto w-full">
        <Table className="min-w-[900px] table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">ტიპი</TableHead>
              <TableHead className="font-semibold">კატეგორია</TableHead>
              <TableHead className="font-semibold">ბრენდი</TableHead>
              <TableHead className="font-semibold">მოდელი</TableHead>
              <TableHead className="font-semibold">სტატუსი</TableHead>
              <TableHead className="font-semibold">განაცხადის თარიღი</TableHead>
              <TableHead className="font-semibold">ცვლილების თარიღი</TableHead>
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
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    {typeLabels[order.service_type] || order.service_type}
                  </TableCell>
                  <TableCell>{order.category.name}</TableCell>
                  <TableCell>{order.brand}</TableCell>
                  <TableCell>{order.model}</TableCell>
                  <TableCell>
                    {statusLabels[order.status] || order.status}
                  </TableCell>
                  <TableCell>
                    {dayjs(order.created_at).format("DD.MM.YYYY HH:mm")}
                  </TableCell>
                  <TableCell>
                    {dayjs(order.updated_at).format("DD.MM.YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/staff/${staffType}/orders/${order.id}`}>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="hover:bg-gray-100 cursor-pointer"
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
