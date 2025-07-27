import { createClient } from '@/utils/supabase/server';
import { startOfMonth, subMonths, endOfMonth, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface MonthRevenue {
  month: string;
  current: number;
  previous: number;
}

export async function getRevenueComparison(gymId: string): Promise<MonthRevenue[]> {
  const supabase = createClient();

  const now = new Date();
  const startCurrentMonth = startOfMonth(now);
  const endCurrentMonth = endOfMonth(now);

  const startPreviousMonth = startOfMonth(subMonths(now, 1));
  const endPreviousMonth = endOfMonth(subMonths(now, 1));

  const { data, error } = await (await supabase)
    .from('payments')
    .select('amount, created_at')
    .eq('gym_id', gymId)
    .eq('status', 'paid')
    .gte('created_at', startPreviousMonth.toISOString())
    .lte('created_at', endCurrentMonth.toISOString());

  if (error) {
    console.error('[Supabase] Erreur paiements:', error.message);
    return [];
  }

  let totalCurrent = 0;
  let totalPrevious = 0;

  for (const payment of data || []) {
    const date = new Date(payment.created_at);
    const amount = Number(payment.amount);

    if (date >= startCurrentMonth && date <= endCurrentMonth) {
      totalCurrent += amount;
    } else if (date >= startPreviousMonth && date <= endPreviousMonth) {
      totalPrevious += amount;
    }
  }

  const currentMonthLabel = format(startCurrentMonth, 'MMMM', { locale: fr });
  const previousMonthLabel = format(startPreviousMonth, 'MMMM', { locale: fr });

  return [
    {
      month: previousMonthLabel.charAt(0).toUpperCase() + previousMonthLabel.slice(1),
      current: 0,
      previous: totalPrevious,
    },
    {
      month: currentMonthLabel.charAt(0).toUpperCase() + currentMonthLabel.slice(1),
      current: totalCurrent,
      previous: totalPrevious,
    },
  ];
}
