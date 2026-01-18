"use client";

import { axiosDelivery, axiosTechnician } from "@/app/api/axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { BsEye } from "react-icons/bs";
import dayjs from "dayjs";
import { useParams } from "next/navigation";

const fetchStaffNotifications = async (staffType: string) => {
  const api = staffType === "technician" ? axiosTechnician : axiosDelivery;
  const { data } = await api.get(`${staffType}/notifications`);
  return data;
};

export default function Page() {
  const { staffType } = useParams<{ staffType: "technician" | "delivery" }>();

  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["staffNotifications", staffType],
    queryFn: () => fetchStaffNotifications(staffType),
    staleTime: 1000 * 60 * 10,
  });

  const getNotificationLink = (notification: any) => {
    const { type, data } = notification;

    if (type === "new_order" || type === "order_updated") {
      if (!data?.order_id) return "";
      return `/staff/${staffType}/orders/${data?.order_id}`;
    }

    if (type === "new_user" || type === "profile_updated") {
      return `/staff/${staffType}/profile`;
    }

    return "";
  };

  // read notification
  const readNotificationMutation = useMutation({
    mutationFn: (id: number) =>
      (staffType === "technician" ? axiosTechnician : axiosDelivery).patch(
        `${staffType}/notifications/${id}`
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staffNotifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["staffUnreadNotifications"],
      });
    },
  });

  const handleReadNotification = (id: number) => {
    readNotificationMutation.mutate(id);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4">შეტყობინებები</h2>

      {isLoading ? (
        <div className="flex justify-center w-full mt-10">
          <Loader2Icon className="animate-spin size-6 text-gray-600" />
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[900px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">შეტყობინება</TableHead>
                <TableHead className="font-semibold">თარიღი</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                notifications?.map((notification: any) => (
                  <TableRow key={notification.id} className="hover:bg-gray-50">
                    <TableCell>{notification.id}</TableCell>
                    <TableCell>{notification.message}</TableCell>
                    <TableCell>
                      {dayjs(notification.created_at).format(
                        "DD.MM.YYYY HH:mm"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={getNotificationLink(notification)}>
                        <Button
                          onClick={() => {
                            if (!notification.read)
                              handleReadNotification(notification.id);
                          }}
                          variant="secondary"
                          size="icon"
                          disabled={
                            readNotificationMutation.isPending &&
                            readNotificationMutation.variables ===
                              notification.id
                          }
                          className={`${
                            !notification.read
                              ? "text-white bg-myLightBlue hover:bg-myBlue"
                              : "hover:bg-gray-100"
                          } cursor-pointer duration-100`}
                        >
                          {readNotificationMutation.isPending &&
                          readNotificationMutation.variables ===
                            notification.id ? (
                            <Loader2Icon className="animate-spin size-4" />
                          ) : (
                            <BsEye className="size-4" />
                          )}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
