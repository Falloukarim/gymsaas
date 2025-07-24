'use client';

import { AreaChart, Card, Title, Flex, Text } from '@tremor/react';
import { CalendarDays, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueChartProps {
  data: {
    date: string;
    amount: number;
  }[];
  totalAmount: number;
  changePercentage: number;
}

const formatAmount = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function RevenueChart({ data, totalAmount, changePercentage }: RevenueChartProps) {
  const lastThreeDaysData = data.slice(-3);
  const chartData = lastThreeDaysData.map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'short'
    }),
    'Paiements': item.amount,
  }));

  const isPositive = changePercentage >= 0;

  return (
    <Card className="bg-gradient-to-tr from-cyan-900 via-slate-900 to-emerald-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Title className="text-lg text-white font-semibold">
            Revenus des 3 derniers jours
          </Title>
          <Text className="text-sm text-muted-foreground mt-1">
            Évolution journalière des paiements
          </Text>
        </div>
        <div className={cn(
          'text-sm font-medium px-3 py-1 rounded-lg flex items-center',
          isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
        )}>
          <TrendingUp className="h-4 w-4 mr-1" />
          {isPositive ? '+' : ''}{Math.round(changePercentage)}%
        </div>
      </div>

      <div className="h-[180px]">
        <AreaChart
          data={chartData}
          index="date"
          categories={['Paiements']}
          colors={["cyan"]}
          valueFormatter={formatAmount}
          showAnimation
          curveType="natural"
          showGridLines={false}
          showLegend={false}
          yAxisWidth={60}
          className="h-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {lastThreeDaysData.map((day, index) => (
          <div key={index} className="bg-gray-900 rounded-xl p-4">
            <Text className="text-xs text-gray-400">
              {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
            </Text>
            <Text className="mt-1 text-white font-semibold text-xl">
              {formatAmount(day.amount)}
            </Text>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center border-t pt-4 border-gray-800 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          {new Date().toLocaleDateString('fr-FR')}
        </span>
      </div>
    </Card>
  );
}
