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
    
    const [
      { count: activeSubscriptions },
      { count: inactiveSubscriptions },
      { data: todayPayments },
      { data: monthlyPayments },
      { count: todayEntries },
      { data: recentSubscriptions },
      { data: recentEntries },
      { data: gym },
      { data: weeklyPayments }
    ] = await Promise.all([
      // Abonnements ACTIFS (end_date >= aujourd'hui)
      (await
            // Abonnements ACTIFS (end_date >= aujourd'hui)
            supabase)
        .from('member_subscriptions')
        .select('*', { count: 'exact' })
        .eq('gym_id', id)
        .gte('end_date', currentDate),
      // Abonnements INACTIFS (end_date < aujourd'hui)
      (await
            // Abonnements INACTIFS (end_date < aujourd'hui)
            supabase)
        .from('member_subscriptions')
        .select('*', { count: 'exact' })
        .eq('gym_id', id)
        .lt('end_date', currentDate),
      // Paiements du jour
      (await
          // Paiements du jour
          supabase)
        .from('payments')
        .select('amount, created_at')
        .eq('gym_id', id)
        .eq('status', 'paid')
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .lte('created_at', new Date(new Date().setHours(23, 59, 59, 999)).toISOString()),
      // Paiements du mois
      (await
          // Paiements du mois
          supabase)
        .from('payments')
        .select('amount, created_at')
        .eq('gym_id', id)
        .eq('status', 'paid')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .lte('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999).toISOString()),
      // Entrées du jour
      (await
          // Entrées du jour
          supabase)
        .from('access_logs')
        .select('*', { count: 'exact' })
        .eq('gym_id', id)
        .gte('timestamp', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .lte('timestamp', new Date(new Date().setHours(23, 59, 59, 999)).toISOString()),
      // 5 derniers abonnements
      (await
          // 5 derniers abonnements
          supabase)
        .from('member_subscriptions')
        .select(`*, members(full_name), subscriptions(name)`)
        .eq('gym_id', id)
        .order('start_date', { ascending: false })
        .limit(5),
      // 5 dernières entrées
      (await
          // 5 dernières entrées
          supabase)
        .from('access_logs')
        .select(`*, members(full_name)`)
        .eq('gym_id', id)
        .order('timestamp', { ascending: false })
        .limit(5),
      // Infos de la salle
      (await
          // Infos de la salle
          supabase)
        .from('gyms')
        .select('name, address')
        .eq('id', id)
        .single(),
      // Paiements des 7 derniers jours pour le graphique
      (await
          // Paiements des 7 derniers jours pour le graphique
          supabase)
        .from('payments')
        .select('amount, created_at')
        .eq('gym_id', id)
        .eq('status', 'paid')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })
    ]);

    // Calcul des totaux
    const todayRevenueTotal = todayPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    const monthlyRevenueTotal = monthlyPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    
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
        changeType: "positive" as const 
      },
      { 
        name: "Revenus mensuels", 
        value: formatCurrency(monthlyRevenueTotal), 
        iconName: "Activity" as const,
        change: "+0%", 
        changeType: "positive" as const 
      },
      { 
        name: "Entrées aujourd'hui", 
        value: todayEntries?.toString() || "0", 
        iconName: "Clock" as const,
        change: "+0%", 
        changeType: "positive" as const 
      },
    ];

    return NextResponse.json({
      stats,
      chartData,
      recentSubscriptions,
      recentEntries,
      gym,
      weeklyRevenueTotal: monthlyRevenueTotal // Vous pouvez ajuster selon vos besoins
    });

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des données' },
      { status: 500 }
    );
  }
}