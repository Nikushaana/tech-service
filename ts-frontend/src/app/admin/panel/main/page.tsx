"use client";

import { axiosAdmin } from "@/app/api/axios";
import { ChartAreaInteractive } from "@/app/components/admin/users-chart";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import React from "react";

const fetchAllStats = async () => {
  const [userRes, devicesRes, orderRes] = await Promise.all([
    axiosAdmin.get("/admin/user-registration-stats"),
    axiosAdmin.get("/admin/used-devices-stats"),
    axiosAdmin.get("/admin/order-stats"),
  ]);

  return {
    userRegistrationStats: userRes.data,
    usedDevicesStats: devicesRes.data,
    orderStats: orderRes.data,
  };
};

export default function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ["allStats"],
    queryFn: fetchAllStats,
  });

  if (isLoading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-y-[20px] w-full">
      {data?.userRegistrationStats?.stats.length > 0 && (
        <ChartAreaInteractive
          userRegistrationStats={data?.userRegistrationStats?.stats}
        />
      )}
    </div>
  );
}
