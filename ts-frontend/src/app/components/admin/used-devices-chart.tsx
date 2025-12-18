"use client";

import { Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  users: {
    label: "რაოდენობა",
  },
} satisfies ChartConfig;

export function UsedDevicesChart({ usedDevicesStats }: any) {
  const chartData = [
    { device: "ტელეფონი", users: usedDevicesStats?.mobile },
    { device: "კომპიუტერი", users: usedDevicesStats?.desktop },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>მომხმარებლის მოწყობილობები</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="device" tickLine={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <Bar dataKey="users" radius={8}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.device === "ტელეფონი" ? "red" : "blue"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
