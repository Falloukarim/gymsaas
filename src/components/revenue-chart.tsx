'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { AreaChart, Title, Text } from '@tremor/react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartData {
  date: string;
  amount: number;
}

interface RevenueChartProps {
  data: ChartData[];
  totalAmount: number;
  changePercentage: number;
}

const formatAmount = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const RevenueChartComponent = ({
  data,
  totalAmount,
  changePercentage,
}: RevenueChartProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Card className="bg-gradient-to-tr from-[#1a2e3a] to-[#0d1a23] h-[300px] animate-pulse border border-gray-700 rounded-xl p-6" />
    );
  }

  const lastDaysData = data.length > 7 ? data.slice(-7) : data;
  const isPositive = changePercentage >= 0;
  const IconComponent = isPositive ? TrendingUp : TrendingDown;

  const chartData = lastDaysData.map((item) => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }),
    Paiements: item.amount,
  }));

  return (
    <Card className="bg-gradient-to-tr from-[#1a2e3a] to-[#0d1a23] border border-gray-700 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Title className="text-lg font-semibold text-white">
            Revenus récents
          </Title>
          <Text className="text-sm text-gray-400 mt-1">
            {lastDaysData.length} derniers jours
          </Text>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <Text className="text-sm text-gray-400">Total</Text>
            <Text className="text-xl font-bold text-white">
              {formatAmount(totalAmount)}
            </Text>
          </div>

          <div
            className={cn(
              'flex items-center px-3 py-1 rounded-lg',
              isPositive
                ? 'text-emerald-400 bg-emerald-900/30'
                : 'text-rose-400 bg-rose-900/30'
            )}
          >
            <IconComponent className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">
              {isPositive ? '+' : ''}
              {Math.round(changePercentage)}%
            </span>
          </div>
        </div>
      </div>

      <AreaChart
        data={chartData}
        index="date"
        categories={['Paiements']}
        colors={['emerald']} 
        showLegend={false}
        showYAxis={false}
        showGradient={true}
        startEndOnly={true}
        className="mt-6 h-[200px]"
        curveType="monotone"
        valueFormatter={(value) => formatAmount(value)}
      />
    </Card>
  );
};

export const RevenueChart = dynamic(() => Promise.resolve(RevenueChartComponent), {
  ssr: false,
  loading: () => (
    <Card className="bg-gradient-to-tr from-[#1a2e3a] to-[#0d1a23] h-[300px] animate-pulse border border-gray-700 rounded-xl p-6" />
  ),
});