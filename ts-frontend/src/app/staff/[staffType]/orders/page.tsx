"use client";

import { axiosDelivery, axiosTechnician } from "@/app/api/axios";
import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { statusTranslations } from "@/app/utils/status-translations";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BsEye } from "react-icons/bs";

export default function Page() {
  const { staffType } = useParams<{ staffType: "technician" | "delivery" }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const api = staffType === "technician" ? axiosTechnician : axiosDelivery;

  const fetchOrder = () => {
    setLoading(true);
    api
      .get(`${staffType}/orders`)
      .then(({ data }) => setOrders(data))
      .catch((err) => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4">ჩემი სერვისები</h2>
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
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია არ მოიძებნა
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.service_type}</TableCell>
                  <TableCell>{order.category.name}</TableCell>
                  <TableCell>{order.brand}</TableCell>
                  <TableCell>{order.model}</TableCell>
                  <TableCell>
                    {statusTranslations[order.status] || order.status}
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
    </div>
  );
}
