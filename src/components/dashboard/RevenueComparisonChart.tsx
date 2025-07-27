'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BarChart, Title, Text } from '@tremor/react';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MonthRevenue {
  month: string;
  current: number;
  previous: number;
}

interface RevenueComparisonChartProps {
  data: MonthRevenue[];
}

const formatAmount = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value);

export const RevenueComparisonChart = ({ data }: RevenueComparisonChartProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Card className="h-[320px] animate-pulse rounded-2xl bg-gradient-to-tr from-[#1a2e3a] to-[#0d1a23] border border-gray-700 p-6" />
    );
  }

  const [currentMonthData] = data.slice(-1);
  const totalCurrent = currentMonthData?.current || 0;
  const totalPrevious = currentMonthData?.previous || 0;

  const changePercentage = totalPrevious
    ? ((totalCurrent - totalPrevious) / totalPrevious) * 100
    : 0;

  const isPositive = changePercentage >= 0;
  const IconComponent = isPositive ? TrendingUp : TrendingDown;

  const chartData = data.map((month) => ({
    Mois: month.month,
    'Ce mois': month.current,
    'Mois précédent': month.previous,
  }));

  return (
    <Card className="rounded-2xl border border-gray-700 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Title className="text-white text-lg sm:text-xl font-semibold tracking-tight">
            Revenus mensuels
          </Title>
          <Text className="text-gray-400 text-sm">Comparaison des 2 derniers mois</Text>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <Text className="text-sm text-gray-400">Total</Text>
            <Text className="text-white text-xl font-bold leading-tight">
              {formatAmount(totalCurrent)}
            </Text>
          </div>
          <div
            className={cn(
              'flex items-center px-3 py-1 rounded-xl transition-colors',
              isPositive
                ? 'bg-green-600/10 text-green-400'
                : 'bg-red-600/10 text-red-400'
            )}
          >
            <IconComponent className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">
              {isPositive ? '+' : ''}
              {Math.round(changePercentage)}%
            </span>
          </div>
        </div>
      </div>

     <BarChart
  data={chartData}
  index="Mois"
  categories={['Ce mois', 'Mois précédent']}
  colors={['emerald', 'gray']} // ✅ couleur verte tremor
  valueFormatter={(v) => `${formatAmount(v as number)}`}
  showLegend={true}
  showYAxis={false}
  showGridLines={false}
  barCategoryGap="24%"
  className="mt-6 text-white"
/>

    </Card>
  );
};
