'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Wallet, Ticket, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartData {
  date: string;
  payments: number;
  tickets: number;
}

interface RevenueChartProps {
  data: ChartData[];
  totalAmount: number;
  changePercentage: number;
  ticketAmount: number;
}

const formatAmount = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value);
};

const RevenueChartComponent = ({
  data,
  totalAmount,
  changePercentage,
  ticketAmount,
}: RevenueChartProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<'7j' | '30j' | '90j'>('7j');
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Card className="bg-glass h-[400px] animate-pulse rounded-2xl border border-white/10 backdrop-blur-lg p-6" />
    );
  }

  const filteredData = {
    '7j': data.slice(-7),
    '30j': data.slice(-30),
    '90j': data.slice(-90),
  }[timeRange];

  const isPositive = changePercentage >= 0;
  const paymentAmount = totalAmount - ticketAmount;

  // Configuration for the modern chart
  const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
  
  const chartOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: '#E2E8F0',
      fontFamily: 'Inter, sans-serif',
      animations: { 
        enabled: true,
        easing: 'easeout',
        speed: 800,
      },
      events: {
        dataPointMouseEnter: (e: any, chart: any, { dataPointIndex }: any) => {
          setHoveredItem(dataPointIndex);
        },
        dataPointMouseLeave: () => {
          setHoveredItem(null);
        },
      },
    },
    colors: ['#4F46E5', '#10B981'],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '60%',
        endingShape: 'rounded',
      },
    },
    dataLabels: { enabled: false },
    stroke: { 
      width: 0,
      curve: 'smooth',
    },
    fill: {
      opacity: 1,
      type: 'solid',
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
      },
    },
    xaxis: {
      categories: filteredData.map(item => 
        new Date(item.date).toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'short' 
        })
      ),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { 
        style: { 
          colors: '#94A3B8',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        },
      },
      tooltip: { enabled: false },
    },
    yaxis: { show: false },
    legend: { show: false },
    tooltip: {
      enabled: false,
      custom: ({ series, seriesIndex, dataPointIndex }: any) => {
        return '';
      },
    },
  };

  const chartSeries = [
    {
      name: 'Paiements',
      data: filteredData.map(item => item.payments)
    },
    {
      name: 'Tickets',
      data: filteredData.map(item => item.tickets)
    }
  ];

  return (
    <Card className="bg-glass rounded-2xl border border-white/10 backdrop-blur-lg p-6">
      <div className="flex flex-col space-y-6">
        {/* Header with animated tabs */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Wallet className="h-5 w-5" />
              </div>
              <span>Performance Financière</span>
            </h3>
            
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              {['7j', '30j', '90j'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={cn(
                    'px-3 py-1 text-sm rounded-md transition-all duration-300',
                    timeRange === range
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Summary cards with floating effect */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={cn(
                "bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 rounded-xl p-4 border border-white/5 transition-all duration-300",
                hoveredItem === null ? "opacity-100" : "opacity-70"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300">Revenu Total</p>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-rose-400" />
                  )}
                  <span className={cn(
                    "text-xs font-medium",
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {changePercentage >= 0 ? '+' : ''}{Math.abs(changePercentage)}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {formatAmount(totalAmount)}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${paymentAmount / totalAmount * 100}%` }}
                  />
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div 
              className={cn(
                "bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl p-4 border border-white/5 transition-all duration-300",
                hoveredItem === null ? "opacity-100" : "opacity-70"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-500/20">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-sm text-gray-300">Paiements</p>
              </div>
              <p className="text-xl font-bold text-emerald-400 mt-2">
                {formatAmount(paymentAmount)}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">
                  {Math.round(paymentAmount / totalAmount * 100)}% du total
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  +2.5% vs période
                </span>
              </div>
            </div>

            <div 
              className={cn(
                "bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 rounded-xl p-4 border border-white/5 transition-all duration-300",
                hoveredItem === null ? "opacity-100" : "opacity-70"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-cyan-500/20">
                  <Ticket className="h-4 w-4 text-cyan-400" />
                </div>
                <p className="text-sm text-gray-300">Tickets</p>
              </div>
              <p className="text-xl font-bold text-cyan-400 mt-2">
                {formatAmount(ticketAmount)}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">
                  {Math.round(ticketAmount / totalAmount * 100)}% du total
                </span>
                <span className="text-xs text-cyan-400 font-medium">
                  +1.8% vs période
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive chart */}
        <div className="relative h-[280px]">
          {typeof window !== 'undefined' && (
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="bar"
              height="100%"
              width="100%"
            />
          )}

          {/* Custom tooltip */}
          {hoveredItem !== null && (
            <div className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-white/10 shadow-lg z-10 transition-all duration-200">
              <p className="text-xs text-gray-300 mb-1">
                {new Date(filteredData[hoveredItem].date).toLocaleDateString('fr-FR', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <p className="text-xs text-gray-400">Paiements</p>
                </div>
                <p className="text-sm font-medium text-white">
                  {formatAmount(filteredData[hoveredItem].payments)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <p className="text-xs text-gray-400">Tickets</p>
                </div>
                <p className="text-sm font-medium text-white">
                  {formatAmount(filteredData[hoveredItem].tickets)}
                </p>
              </div>
              <div className="border-t border-white/10 mt-2 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-300">Total</p>
                  <p className="text-sm font-semibold text-white">
                    {formatAmount(filteredData[hoveredItem].payments + filteredData[hoveredItem].tickets)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend with interactive elements */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            onMouseEnter={() => setHoveredItem(null)}
          >
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span className="text-xs text-gray-300">Paiements</span>
            <span className="text-xs font-medium text-white ml-1">
              {formatAmount(paymentAmount)}
            </span>
          </div>
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            onMouseEnter={() => setHoveredItem(null)}
          >
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-gray-300">Tickets</span>
            <span className="text-xs font-medium text-white ml-1">
              {formatAmount(ticketAmount)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-400">
              {timeRange === '7j' ? '7 derniers jours' : 
               timeRange === '30j' ? '30 derniers jours' : '90 derniers jours'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const RevenueChart = dynamic(() => Promise.resolve(RevenueChartComponent), {
  ssr: false,
  loading: () => (
    <Card className="bg-glass h-[400px] animate-pulse rounded-2xl border border-white/10 backdrop-blur-lg p-6" />
  ),
});