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
import { useParams, useSearchParams } from "next/navigation";
import { axiosDelivery, axiosTechnician } from "@/app/lib/api/axios";
import Pagination from "@/app/components/pagination/pagination";
import LinearLoader from "@/app/components/linearLoader";
import { toast } from "react-toastify";
import { fetchStaffUnreadNotifications } from "@/app/lib/api/staffUnreadNotifications";

const fetchStaffNotifications = async (staffType: StaffRole, page: number) => {
  const api = staffType === "technician" ? axiosTechnician : axiosDelivery;
  const { data } = await api.get(`${staffType}/notifications?page=${page}`);
  return data;
};

export default function Page() {
  const { staffType } = useParams<{ staffType: StaffRole }>();

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const queryClient = useQueryClient();

  const { data: notifications, isFetching } = useQuery({
    queryKey: ["staffNotifications", staffType, page],
    queryFn: () => fetchStaffNotifications(staffType, page),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  const { data: unreadNotifications } = useQuery({
    queryKey: ["staffUnreadNotifications", staffType],
    queryFn: () => fetchStaffUnreadNotifications(staffType),
    staleTime: 1000 * 60 * 10,
    retry: false,
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
        `${staffType}/notifications/${id}`,
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

  const readAllNotificationsMutation = useMutation({
    mutationFn: () =>
      (staffType === "technician" ? axiosTechnician : axiosDelivery).post(
        `${staffType}/notifications/read-all`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staffNotifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["staffUnreadNotifications"],
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
