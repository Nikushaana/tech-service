"use client";

import { OrdersChart } from "@/app/components/admin/orders-chart";
import { UsedDevicesChart } from "@/app/components/admin/used-devices-chart";
import { UsersChart } from "@/app/components/admin/users-chart";
import { axiosAdmin } from "@/app/lib/api/axios";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

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
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[20px]">
      {data?.userRegistrationStats?.stats.length > 0 && (
        <div className="col-span-1 sm:col-span-3">
          <UsersChart userRegistrationStats={data?.userRegistrationStats} />
        </div>
      )}
      <UsedDevicesChart usedDevicesStats={data?.usedDevicesStats} />
      <div className="col-span-1 sm:col-span-2 min-h-[200px]">
        <OrdersChart ordersStats={data?.orderStats} />
      </div>
    </div>
  );
}
