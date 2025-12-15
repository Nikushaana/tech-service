"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  companies: {
    label: "კომპანიები",
    color: "blue",
  },
  individuals: {
    label: "კერძო მომხმარებლები",
    color: "red",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({ userRegistrationStats }: any) {
  const [timeRange, setTimeRange] = React.useState("all");

  const filteredData = React.useMemo(() => {
    if (timeRange === "all") return userRegistrationStats;

    const referenceDate = new Date(
      userRegistrationStats[userRegistrationStats.length - 1].date
    );
    const startDate = new Date(referenceDate);

    switch (timeRange) {
      case "1y":
        startDate.setFullYear(referenceDate.getFullYear() - 1);
        break;
      case "6m":
        startDate.setMonth(referenceDate.getMonth() - 6);
        break;
      case "3m":
        startDate.setMonth(referenceDate.getMonth() - 3);
        break;
      case "1m":
        startDate.setMonth(referenceDate.getMonth() - 1);
        break;
      default:
        break;
    }

    return userRegistrationStats.filter(
      (item: any) => new Date(item.date) >= startDate
    );
  }, [timeRange]);

  return (
    <Card className="pt-0 w-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <CardTitle>მომხმარებლები</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all" className="rounded-lg">
              ყველა
            </SelectItem>
            <SelectItem value="1y" className="rounded-lg">
              ბოლო 1 წელი
            </SelectItem>
            <SelectItem value="6m" className="rounded-lg">
              ბოლო 6 თვე
            </SelectItem>
            <SelectItem value="3m" className="rounded-lg">
              ბოლო 3 თვე
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCompanies" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="blue" stopOpacity={0.8} />
                <stop offset="95%" stopColor="blue" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillIndividuals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="red" stopOpacity={0.8} />
                <stop offset="95%" stopColor="red" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={30}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="companies"
              type="natural"
              fill="url(#fillCompanies)"
              stroke="blue"
              stackId="a"
            />
            <Area
              dataKey="individuals"
              type="natural"
              fill="url(#fillIndividuals)"
              stroke="red"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
