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
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/app/lib/api/axios";
import Pagination from "@/app/components/pagination/pagination";
import LinearLoader from "@/app/components/linearLoader";
import { toast } from "react-toastify";
import { fetchStaffUnreadNotifications } from "@/app/lib/api/staffUnreadNotifications";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { Dropdown } from "@/app/components/inputs/drop-down";
import DateRangePicker from "@/app/components/inputs/date-range-picker";
import { useEffect, useState } from "react";

const fetchStaffNotifications = async (
  staffType: StaffRole,
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
    `${staffType}/notifications?${params.toString()}`,
  );
  return data;
};

const notificationTypes = [
  { id: 1, name: "შეკვეთების ინფორმაცია", nameEng: "order_updated" },
  { id: 2, name: "რეგისტრაცია", nameEng: "new_user" },
  { id: 3, name: "პროფილის ინფორმაცია", nameEng: "profile_updated" },
];

export default function StaffNotificationsClientComponent() {
  const { staffType } = useParams<{ staffType: StaffRole }>();

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const [searchInput, setSearchInput] = useState(search);

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

  const queryClient = useQueryClient();

  const { data: notifications, isFetching } = useQuery({
    queryKey: ["staffNotifications", staffType, page, type, search, from, to],
    queryFn: () =>
      fetchStaffNotifications(staffType, page, type, search, from, to),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  const { data: unreadNotifications } = useQuery({
    queryKey: ["staffUnreadNotifications", staffType],
    queryFn: () => fetchStaffUnreadNotifications(staffType),
    staleTime: 1000 * 60 * 10,
    enabled: !!staffType,
    retry: false,
  });

  const getNotificationLink = (notification: any) => {
    const { type, order_id } = notification;

    if (type === "order_updated") {
      if (!order_id) return "";
      return `/staff/${staffType}/orders/${order_id}`;
    }

    if (type === "new_user" || type === "profile_updated") {
      return `/staff/${staffType}/profile`;
    }

    return "";
  };

  // read notification
  const readNotificationMutation = useMutation({
    mutationFn: (id: number) =>
      (staffType === "technician" ? api : api).patch(
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
      (staffType === "technician" ? api : api).post(
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
      <h2 className="text-xl font-semibold mb-2">შეტყობინებები</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-4 gap-[20px] items-end">
        <PanelFormInput
          id="search"
          value={searchInput}
          label="ფილტრი"
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Dropdown
          data={notificationTypes}
          id="type"
          value={type}
          label="ტიპი"
          valueKey="nameEng"
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
        <Button onClick={clearFilters} className="cursor-pointer rounded-lg">
          გასუფთავება
        </Button>
      </div>

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
