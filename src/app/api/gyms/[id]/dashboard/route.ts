// src/app/api/gyms/[id]/dashboard/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Gym ID non défini' }, { status: 400 });
  }

  try {
    const currentDate = new Date().toISOString();
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    const [
      { count: activeSubscriptions },
      { count: inactiveSubscriptions },
      { data: todayPayments },
      { data: monthlyPayments },
      { count: todayEntries },
      { data: recentSubscriptions },
      { data: recentEntries },
      { data: gym },
      { data: weeklyPayments },
      { data: todayTickets },
      { data: weekTickets },
      { data: monthlyTickets } // Nouvelle requête pour les tickets du mois
    ] = await Promise.all([
      (await supabase)
        .from('member_subscriptions')
        .select('*', { count: 'exact' })
        .eq('gym_id', id)
        .gte('end_date', currentDate),
      
      (await supabase)
        .from('member_subscriptions')
        .select('*', { count: 'exact' })
        .eq('gym_id', id)
        .lt('end_date', currentDate),
      
      (await supabase)
        .from('payments')
        .select('amount, created_at')
        .eq('gym_id', id)
        .eq('status', 'paid')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd),
      
      (await supabase)
        .from('payments')
        .select('amount, created_at')
        .eq('gym_id', id)
        .eq('status', 'paid')
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd),
      
      (await supabase)
        .from('access_logs')
        .select('*', { count: 'exact' })
        .eq('gym_id', id)
        .gte('timestamp', todayStart)
        .lte('timestamp', todayEnd),
      
      (await supabase)
        .from('member_subscriptions')
        .select(`*, members(full_name), subscriptions(name)`)
        .eq('gym_id', id)
        .order('start_date', { ascending: false })
        .limit(5),
      
      (await supabase)
        .from('access_logs')
        .select(`*, members(full_name)`)
        .eq('gym_id', id)
        .order('timestamp', { ascending: false })
        .limit(5),
      
      (await supabase)
        .from('gyms')
        .select('name, address')
        .eq('id', id)
        .single(),
      
      (await supabase)
        .from('payments')
        .select('amount, created_at')
        .eq('gym_id', id)
        .eq('status', 'paid')
        .gte('created_at', weekStart)
        .order('created_at', { ascending: true }),
      
      (await supabase)
        .from('tickets')
        .select('price, printed_at')
        .eq('gym_id', id)
        .gte('printed_at', todayStart)
        .lte('printed_at', todayEnd),
      
      (await supabase)
        .from('tickets')
        .select('price, printed_at')
        .eq('gym_id', id)
        .gte('printed_at', weekStart),
      
      // Nouvelle requête pour les tickets du mois
      (await
        // Nouvelle requête pour les tickets du mois
        supabase)
        .from('tickets')
        .select('price')
        .eq('gym_id', id)
        .gte('printed_at', monthStart)
        .lte('printed_at', monthEnd)
    ]);

    // Calcul des totaux combinés (paiements + tickets)
    const todayRevenueTotal = (todayPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0) 
                            + (todayTickets?.reduce((sum, ticket) => sum + (ticket.price || 0), 0) || 0);

    const monthlyRevenueTotal = (monthlyPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0)
                              + (monthlyTickets?.reduce((sum, ticket) => sum + (ticket.price || 0), 0) || 0);

    // Statistiques spécifiques des tickets
    const todayTicketCount = todayTickets?.length || 0;
    const todayTicketTotal = todayTickets?.reduce((sum, ticket) => sum + (ticket.price || 0), 0) || 0;
    const weekTicketCount = weekTickets?.length || 0;
    const weekTicketTotal = weekTickets?.reduce((sum, ticket) => sum + (ticket.price || 0), 0) || 0;

    // Préparation des données pour le graphique
    const chartData = weeklyPayments?.map(payment => ({
      date: payment.created_at,
      amount: payment.amount
    })) || [];

    // Formatage des montants
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    // Préparation des statistiques
    const stats = [
      { 
        name: "Abonnements actifs", 
        value: activeSubscriptions?.toString() || "0", 
        iconName: "CreditCard" as const,
        change: "+0%", 
        changeType: "positive" as const 
      },
      { 
        name: "Abonnements inactifs", 
        value: inactiveSubscriptions?.toString() || "0", 
        iconName: "Users" as const,
        change: "+0%", 
        changeType: "positive" as const 
      },
      { 
        name: "Revenu du jour", 
        value: formatCurrency(todayRevenueTotal), 
        iconName: "Euro" as const,
        change: "+0%", 
        changeType: "positive" as const,
        description: `Dont ${formatCurrency(todayTicketTotal)} en tickets`
      },
      { 
        name: "Revenus mensuels", 
        value: formatCurrency(monthlyRevenueTotal), 
        iconName: "Activity" as const,
        change: "+0%", 
        changeType: "positive" as const,
        description: `Dont ${formatCurrency(monthlyTickets?.reduce((sum, ticket) => sum + (ticket.price || 0), 0) || 0)} en tickets`
      },
      { 
        name: "Entrées aujourd'hui", 
        value: todayEntries?.toString() || "0", 
        iconName: "Clock" as const,
        change: "+0%", 
        changeType: "positive" as const 
      }
    ];

    return NextResponse.json({
      stats,
      chartData,
      recentSubscriptions,
      recentEntries,
      gym,
      weeklyRevenueTotal: monthlyRevenueTotal,
      ticketStats: {
        today_count: todayTicketCount,
        today_total: todayTicketTotal,
        week_count: weekTicketCount,
        week_total: weekTicketTotal
      }
    });

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des données' },
      { status: 500 }
    );
  }
}