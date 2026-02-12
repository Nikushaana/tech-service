"use client";

import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import Link from "next/link";
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
import { axiosAdmin } from "@/app/lib/api/axios";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/app/components/pagination/pagination";
import LinearLoader from "@/app/components/linearLoader";
import { Dropdown } from "@/app/components/inputs/drop-down";
import { useOrderTypeStatusOptionsStore } from "@/app/store/orderTypeStatusOptionsStore";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { useEffect, useState } from "react";
import DateRangePicker from "@/app/components/inputs/date-range-picker";

const fetchAdminOrders = async (
  page: number,
  service_type: string,
  status: string,
  search: string,
  from: string,
  to: string,
) => {
  const params = new URLSearchParams();

  if (page) params.set("page", page.toString());
  if (service_type) params.set("service_type", service_type);
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const { data } = await axiosAdmin.get(`admin/orders?${params.toString()}`);
  return data;
};

export default function AdminOrdersClientComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const service_type = searchParams.get("service_type") || "";
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const [searchInput, setSearchInput] = useState(search);

  const { statusOptions, typeOptions } = useOrderTypeStatusOptionsStore();

  // search delay
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // fetch data
  const { data: orders, isFetching } = useQuery({
    queryKey: ["adminOrders", page, service_type, status, search, from, to],
    queryFn: () =>
      fetchAdminOrders(page, service_type, status, search, from, to),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  // change filter values
  const handleChange = (e: {
    target: {
      id: string;
      value: { from: string | null; to: string | null } | string;
    };
  }) => {
    const { id, value } = e.target;

    const params = new URLSearchParams(searchParams.toString());

    if (id === "date_range" && typeof value !== "string") {
      if (value.from) params.set("from", value.from);
      else params.delete("from");

      if (value.to) params.set("to", value.to);
      else params.delete("to");
    } else if (typeof value === "string") {
      params.set(id, value);
    }

    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Clear all filters
  const clearFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    setSearchInput("");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-2">
      <h2 className="text-xl font-semibold mb-2">მომხმარებლების სერვისები</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 mb-4 gap-[20px] items-end">
        <PanelFormInput
          id="search"
          value={searchInput}
          label="ფილტრი"
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Dropdown
          data={typeOptions}
          id="service_type"
          value={service_type}
          label="ტიპი"
          valueKey="id"
          labelKey="name"
          onChange={handleChange}
        />
        <DateRangePicker
          id="date_range"
          value={{
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
          }}
          label="თარიღი"
          onChange={handleChange}
        />
        <Dropdown
          data={statusOptions}
          id="status"
          value={status}
          label="სტატუსი"
          valueKey="id"
          labelKey="name"
          onChange={handleChange}
        />
        <Button onClick={clearFilters} className="cursor-pointer rounded-lg sm:col-span-2 md:col-span-1">
          გასუფთავება
        </Button>
      </div>
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
                    <Link href={`/admin/panel/orders/${order.id}`}>
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
