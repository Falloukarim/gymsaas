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

const formatCfa = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace(' XOF', '') + '';
};

export function RevenueChart({ data, period, totalAmount, changePercentage }: RevenueChartProps) {
  // Filtre les 3 derniers jours
  const lastThreeDaysData = data.slice(-3);
  
  // Formatage des dates en français
  const chartData = lastThreeDaysData.map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    }),
    'Revenus': item.amount
  }));

  const isPositive = changePercentage >= 0;
  const periodLabels = {
    '3j': '3 derniers jours',
    '7j': '7 jours', 
    '30j': '30 jours'
  };

  return (
    <Card className="bg-[#0f172a] border-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Flex alignItems="center" className="gap-2">
              <Wallet className="h-5 w-5 text-cyan-400" />
              <Title className="text-lg font-semibold text-white">
                Revenus récents
              </Title>
            </Flex>
            <Text className="text-sm text-gray-400 mt-1">
              Derniers paiements ({periodLabels[period]})
            </Text>
          </div>
          
          {!isNaN(changePercentage) && (
            <Badge 
              color={isPositive ? "emerald" : "rose"}
              icon={isPositive ? ArrowUpRight : ArrowDownRight}
              className="rounded-lg px-3 py-1"
            >
              {isPositive ? '+' : ''}{Math.round(changePercentage)}%
            </Badge>
          )}
        </div>

        {/* Total amount */}
        <div className="flex items-end gap-2">
          <Text className="text-2xl font-bold text-white">
            {formatCfa(totalAmount)}
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
              {Math.round(changePercentage)}% vs précédent
            </Text>
          )}
        </div>

        {/* Chart */}
        <div className="mt-4 h-[200px]">
          <AreaChart
            data={chartData}
            index="date"
            categories={['Revenus']}
            colors={['cyan']}
            valueFormatter={(value) => formatCfa(value).replace('', '')}
            showAnimation={true}
            animationDuration={1000}
            curveType="monotone"
            showGridLines={false}
            yAxisWidth={60}
            className="h-full"
          />
        </div>

        {/* Détails des 3 derniers jours */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {lastThreeDaysData.map((day, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-3 text-center">
              <Text className="text-xs text-gray-400">
                {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
              </Text>
              <Text className="font-semibold text-white mt-1">
                {formatCfa(day.amount).replace('', '')}
              </Text>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-2 text-sm text-gray-400">
          <CalendarDays className="h-4 w-4" />
          <span>Mis à jour: {new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
    </Card>
  );
}