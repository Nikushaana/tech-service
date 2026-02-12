"use client";

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
import { axiosAdmin } from "@/app/lib/api/axios";
import { useSearchParams } from "next/navigation";
import Pagination from "@/app/components/pagination/pagination";
import LinearLoader from "@/app/components/linearLoader";
import { toast } from "react-toastify";
import { fetchAdminUnreadNotifications } from "@/app/lib/api/adminUnreadNotifications";

const fetchAdminNotifications = async (page: number) => {
  const { data } = await axiosAdmin.get(`admin/notifications?page=${page}`);
  return data;
};

export default function AdminNotificationsClientComponent() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const queryClient = useQueryClient();

  const { data: notifications, isFetching } = useQuery({
    queryKey: ["adminNotifications", page],
    queryFn: () => fetchAdminNotifications(page),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  const { data: unreadNotifications } = useQuery({
    queryKey: ["adminUnreadNotifications"],
    queryFn: () => fetchAdminUnreadNotifications(),
    staleTime: 1000 * 60 * 10,
    retry: false,
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

    if (type === "new_order" || type === "order_updated") {
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

  const readAllNotificationsMutation = useMutation({
    mutationFn: () => axiosAdmin.post(`admin/notifications/read-all`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["adminNotifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["adminUnreadNotifications"],
      });

      toast.success("ყველა შეტყობინება მოინიშნა როგორც ნანახი");
    },
    onError: () => {
      toast.error("ყველა შეტყობინება ვერ მოინიშნა როგორც ნანახი");
    },
  });

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-2">
      <h2 className="text-xl font-semibold mb-2">შეტყობინებები</h2>

      <div className="flex justify-end">
        <Pagination totalPages={notifications?.totalPages} currentPage={page} />
      </div>

      <LinearLoader isLoading={isFetching} />

      <div className="overflow-x-auto w-full">
        <Table className="min-w-[900px] table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">შეტყობინება</TableHead>
              <TableHead className="font-semibold">თარიღი</TableHead>
              <TableHead className="text-right py-2">
                {unreadNotifications > 0 && (
                  <Button
                    onClick={() => readAllNotificationsMutation.mutate()}
                    variant="secondary"
                    size="icon"
                    disabled={readAllNotificationsMutation.isPending}
                    className={`text-white bg-myLightBlue hover:bg-myBlue cursor-pointer duration-100`}
                  >
                    {readAllNotificationsMutation.isPending ? (
                      <Loader2Icon className="animate-spin size-4" />
                    ) : (
                      <BsEye className="size-4" />
                    )}
                  </Button>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!notifications ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია იძებნება...
                </TableCell>
              </TableRow>
            ) : notifications?.total === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია არ მოიძებნა
                </TableCell>
              </TableRow>
            ) : (
              notifications?.data?.map((notification: any) => (
                <TableRow key={notification.id} className="hover:bg-gray-50">
                  <TableCell>{notification.id}</TableCell>
                  <TableCell>{notification.message}</TableCell>
                  <TableCell>
                    {dayjs(notification.created_at).format("DD.MM.YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={getNotificationLink(notification)}>
                      <Button
                        onClick={() => {
                          if (!notification.read)
                            readNotificationMutation.mutate(notification.id);
                        }}
                        variant="secondary"
                        size="icon"
                        disabled={
                          (readNotificationMutation.isPending &&
                            readNotificationMutation.variables ===
                              notification.id) ||
                          (!notification.read &&
                            readAllNotificationsMutation.isPending)
                        }
                        className={`${
                          !notification.read
                            ? "text-white bg-myLightBlue hover:bg-myBlue"
                            : "hover:bg-gray-100"
                        } cursor-pointer duration-100`}
                      >
                        {(readNotificationMutation.isPending &&
                          readNotificationMutation.variables ===
                            notification.id) ||
                        (!notification.read &&
                          readAllNotificationsMutation.isPending) ? (
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

      <div className="flex justify-end">
        <Pagination totalPages={notifications?.totalPages} currentPage={page} />
      </div>
    </div>
  );
}
