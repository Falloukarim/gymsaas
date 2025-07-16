"use client";

import { AreaChart } from '@tremor/react';

interface RevenueChartProps {
  gymId: string;
  data: {
    date: string;
    amount: number;
  }[];
}

interface RevenueChartProps {
  data: {
    date: string;
    amount: number;
  }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[350px]">
      <AreaChart
        className="h-full mt-4"
        data={data}
        categories={['amount']}
        index="date"
        colors={['emerald']}
        yAxisWidth={60}
      />
    </div>
  );
}
