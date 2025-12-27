"use client";

import { axiosAdmin } from "@/app/api/axios";
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

const fetchAdminNotifications = async () => {
  const { data } = await axiosAdmin.get(`admin/notifications`);
  return data;
};

export default function UsersClient() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["adminNotifications"],
    queryFn: fetchAdminNotifications,
    staleTime: 1000 * 60 * 10,
  });

  const getNotificationLink = (notification: any) => {
    const { type, data } = notification;

    if (type === "new_user" || type === "profile_updated") {
      const isStaff =
        data?.user_role === "technician" || data?.user_role === "delivery";

      return `/admin/panel/${isStaff ? "staff" : "users"}/${data?.user_role}-${
        data?.user_id
      }`;
    }

    if (type === "new_review") {
      return `/admin/panel/reviews/${data?.review_id}`;
    }

    if (type === "new_order") {
      return `/admin/panel/orders/${data?.order_id}`;
    }

    return "";
  };

  // read notification
  const readNotificationMutation = useMutation({
    mutationFn: (id: number) => axiosAdmin.patch(`admin/notifications/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["adminNotifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["adminUnreadNotifications"],
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
