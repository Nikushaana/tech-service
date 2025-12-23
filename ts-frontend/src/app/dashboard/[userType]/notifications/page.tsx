"use client";

import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosCompany, axiosIndividual } from "@/app/api/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BsEye } from "react-icons/bs";

const fetchUserNotifications = async (userType: string) => {
  const api = userType === "company" ? axiosCompany : axiosIndividual;
  const { data } = await api.get(`${userType}/notifications`);
  return data;
};

export default function Page() {
  const { userType } = useParams<{
    userType: "company" | "individual";
  }>();

  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["userNotifications", userType],
    queryFn: () => fetchUserNotifications(userType),
    staleTime: 1000 * 60 * 10,
  });

  // read notification
  const readNotificationMutation = useMutation({
    mutationFn: (id: number) =>
      (userType === "company" ? axiosCompany : axiosIndividual).patch(
        `${userType}/notifications/${id}`
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userNotifications"],
      });
    },
  });

  const handleReadNotification = (id: number) => {
    readNotificationMutation.mutate(id);
  };

  if (isLoading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className={`w-full flex flex-col gap-y-2`}>
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">შეტყობინებები</h2>
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
                      <Button
                        onClick={() => {
                          if (!notification.read)
                            handleReadNotification(notification.id);
                        }}
                        variant="secondary"
                        size="icon"
                        disabled={
                          readNotificationMutation.isPending &&
                          readNotificationMutation.variables === notification.id
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
