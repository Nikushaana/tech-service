"use client";

import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BsEye } from "react-icons/bs";
import Link from "next/link";
import { api } from "@/app/lib/api/axios";
import Pagination from "@/app/components/pagination/pagination";
import LinearLoader from "@/app/components/linearLoader";
import { fetchUserUnreadNotifications } from "@/app/lib/api/userUnreadNotifications";
import { toast } from "react-toastify";
import { CiFilter } from "react-icons/ci";
import { useNotificationsStore } from "@/app/store/useNotificationStore";

const fetchUserNotifications = async (
  userType: ClientRole,
  page: number,
  type: string,
  search: string,
  from: string,
  to: string,
) => {
  const params = new URLSearchParams();

  if (page) params.set("page", page.toString());
  if (type) params.set("type", type);
  if (search) params.set("search", search);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const { data } = await api.get(
    `${userType}/notifications?${params.toString()}`,
  );
  return data;
};

export default function UserNotificationsClientComponent() {
  const { userType } = useParams<{
    userType: ClientRole;
  }>();

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const queryClient = useQueryClient();

  const { notificationTypeOptions, toggleOpenFilterNotificationModal } =
    useNotificationsStore();
  const typeFilters = [
    { id: 1, name: "ყველა", nameEng: "" },
    ...notificationTypeOptions,
  ];

  const { data: notifications, isFetching } = useQuery({
    queryKey: ["userNotifications", userType, page, type, search, from, to],
    queryFn: () =>
      fetchUserNotifications(userType, page, type, search, from, to),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  const { data: unreadNotifications } = useQuery({
    queryKey: ["userUnreadNotifications", userType],
    queryFn: () => fetchUserUnreadNotifications(userType),
    staleTime: 1000 * 60 * 10,
    enabled: !!userType,
    retry: false,
  });

  const getNotificationLink = (notification: any) => {
    const { type, order_id } = notification;

    if (type === "new_user" || type === "profile_updated") {
      return `/dashboard/${userType}/profile`;
    }

    if (type === "new_review") {
      return `/dashboard/${userType}/reviews`;
    }

    if (type === "new_order" || type === "order_updated") {
      return `/dashboard/${userType}/orders/${order_id}`;
    }

    return "";
  };

  // read notification
  const readNotificationMutation = useMutation({
    mutationFn: (id: number) => api.patch(`${userType}/notifications/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userNotifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userUnreadNotifications"],
      });
    },
  });

  const readAllNotificationsMutation = useMutation({
    mutationFn: () => api.post(`${userType}/notifications/read-all`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userNotifications", userType],
      });
      queryClient.invalidateQueries({
        queryKey: ["userUnreadNotifications", userType],
      });

      toast.success("ყველა შეტყობინება მოინიშნა როგორც ნანახი");
    },
    onError: () => {
      toast.error("ყველა შეტყობინება ვერ მოინიშნა როგორც ნანახი");
    },
  });

  // change filter type
  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("type", value);
    } else {
      params.delete("type");
    }

    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const countFilter = [type, search, from].filter(Boolean).length;

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center gap-2 justify-between">
        <h1 className="text-xl">შეტყობინებები</h1>
        <Button
          onClick={toggleOpenFilterNotificationModal}
          variant="outline"
          className="cursor-pointer"
        >
          <CiFilter className="size-4" />{" "}
          <p className="hidden sm:flex">
            ფილტრი {countFilter !== 0 && `(${countFilter})`}
          </p>
        </Button>
      </div>

      <div className="flex items-center overflow-x-auto">
        {typeFilters.map((type1) => {
          const isActive = type === type1.nameEng;

          return (
            <button
              key={type1.id || "all"}
              onClick={() => handleChange(type1.nameEng)}
              className={`px-2 sm:px-4 py-1.5 text-[13px] cursor-pointer duration-100 border-b-1 shrink-0
        ${
          isActive
            ? "text-myLightBlue border-b-myLightBlue"
            : "hover:text-myLightBlue border-b-transparent hover:border-b-myLightBlue"
        }`}
            >
              {type1.name}
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
              <TableHead>შეტყობინება</TableHead>
              <TableHead>თარიღი</TableHead>
              <TableHead className="text-right py-2">
                {unreadNotifications > 0 && (
                  <Button
                    onClick={() => readAllNotificationsMutation.mutate()}
                    variant="secondary"
                    size="icon"
                    disabled={readAllNotificationsMutation.isPending}
                    className={`text-white bg-myLightBlue hover:bg-myBlue cursor-pointer rounded-lg`}
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
                <TableRow key={notification.id} className="hover:bg-gray-100">
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
                        } cursor-pointer rounded-lg`}
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
