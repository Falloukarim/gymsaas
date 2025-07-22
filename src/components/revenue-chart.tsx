"use client";

import { AreaChart, Card, Title, Flex, Badge, Text } from '@tremor/react';
import { ArrowUpRight, ArrowDownRight, Wallet, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueChartProps {
  data: {
    date: string;
    amount: number;
  }[];
  period: '3j' | '7j' | '30j';
  totalAmount: number;
  changePercentage: number;
}

const formatAmount = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export function RevenueChart({ data, period, totalAmount, changePercentage }: RevenueChartProps) {
  const lastThreeDaysData = data.slice(-3);
  const isPositive = changePercentage >= 0;
  
  const chartData = lastThreeDaysData.map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    }),
    'Revenus': item.amount
  }));

  const periodLabels = {
    '3j': '3 derniers jours',
    '7j': '7 derniers jours', 
    '30j': '30 derniers jours'
  };

  return (
    <Card className="bg-[#0f172a] border-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Flex alignItems="center" className="gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Wallet className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <Title className="text-lg font-semibold text-white">
                  Performance financière
                </Title>
                <Text className="text-sm text-gray-400 mt-1">
                  {periodLabels[period]}
                </Text>
              </div>
            </Flex>
          </div>
          
          {!isNaN(changePercentage) && (
            <Badge 
              color={isPositive ? "emerald" : "rose"}
              icon={isPositive ? ArrowUpRight : ArrowDownRight}
              className="rounded-lg px-3 py-1 text-sm"
            >
              {isPositive ? '+' : ''}{Math.round(changePercentage)}%
            </Badge>
          )}
        </div>

        {/* Metrics */}
        <div className="space-y-2">
          <Text className="text-gray-400 text-sm">Revenu total</Text>
          <div className="flex items-baseline gap-3">
            <Text className="text-3xl font-bold text-white">
              {formatAmount(totalAmount)}
            </Text>
            {!isNaN(changePercentage) && (
              <Text className={cn(
                "text-sm flex items-center",
                isPositive ? "text-emerald-500" : "text-rose-500"
              )}>
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {Math.abs(Math.round(changePercentage))}% vs période précédente
              </Text>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="mt-2 h-[180px]">
          <AreaChart
            data={chartData}
            index="date"
            categories={['Revenus']}
            colors={['cyan']}
            valueFormatter={formatAmount}
            showAnimation={true}
            animationDuration={1500}
            curveType="monotone"
            showGridLines={false}
            showLegend={false}
            yAxisWidth={60}
            className="h-full"
          />
        </div>

        {/* Daily breakdown */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {lastThreeDaysData.map((day, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <Text className="text-xs text-gray-400 uppercase tracking-wider">
                {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
              </Text>
              <Text className="font-medium text-white mt-1 text-lg">
                {formatAmount(day.amount)}
              </Text>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-800">
          <Text className="text-xs text-gray-500">
            Données mises à jour quotidiennement
          </Text>
          <Flex alignItems="center" className="gap-2 text-xs text-gray-400">
            <CalendarDays className="h-3 w-3" />
            <span>{new Date().toLocaleDateString('fr-FR')}</span>
          </Flex>
        </div>
      </div>
    </Card>
  );
}