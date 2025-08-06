import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';
import { RevenueChart } from '@/components/revenue-chart';
import { getGymIdForCurrentUser } from '@/lib/auth';

export default async function GymDashboardPage({ 
  params: resolvedParams 
}: { 
  params: Promise<{ id: string }> 
}) {
  const params = await resolvedParams;
  const { id } = params;

  if (!id) {
    console.error('Gym ID non défini');
    redirect('/gyms/new');
  }

  const supabase = createClient();
  const { data: { user }, error: authError } = await (await supabase).auth.getUser();
  const gymId = await getGymIdForCurrentUser();
  
  if (authError || !user) redirect('/login');

  // Vérification des permissions
  const { data: gbus, error: gbusError } = await (await supabase)
    .from('gbus')
    .select('role')
    .eq('gym_id', id)
    .eq('user_id', user.id)
    .single();

  if (gbusError || !gbus) {
    console.error("Accès non autorisé", { 
      userId: user.id, 
      gymId: params.id,
      error: gbusError 
    });
    redirect('/gyms/new');
  }

  // Vérification de l'abonnement
  const { data: gym } = await (await supabase)
    .from('gyms')
    .select('subscription_active, trial_end_date, trial_used')
    .eq('id', params.id)
    .single();

  const isTrialActive = gym?.trial_end_date 
    && new Date(gym.trial_end_date) > new Date() 
    && gym.trial_used === false;

  if (!gym?.subscription_active && !isTrialActive) {
    redirect('/subscription');
  }

  // Récupération des données pour le graphique
  const { data: paymentsData } = await (await supabase)
    .from('payments')
    .select('amount, created_at')
    .eq('gym_id', id)
    .eq('status', 'paid')
    .order('created_at', { ascending: true });

  const { data: ticketsData } = await (await supabase)
    .from('tickets')
    .select('price, printed_at')
    .eq('gym_id', id)
    .order('printed_at', { ascending: true });

  // Préparation des données combinées
  const combinedData = [...paymentsData || [], ...ticketsData || []]
    .map(item => ({
      date: item.created_at || item.printed_at,
      amount: item.amount || item.price,
      type: item.created_at ? 'payment' : 'ticket'
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Agrégation par jour
  const dailyData: Record<string, {payments: number, tickets: number}> = {};

  combinedData.forEach(item => {
    const date = new Date(item.date).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { payments: 0, tickets: 0 };
    }
    
    if (item.type === 'payment') {
      dailyData[date].payments += item.amount;
    } else {
      dailyData[date].tickets += item.amount;
    }
  });

  // Formatage pour le graphique
  const chartData = Object.entries(dailyData).map(([date, values]) => ({
    date,
    payments: values.payments,
    tickets: values.tickets
  }));

  // Calcul des totaux
  const totalAmount = chartData.reduce((sum, day) => sum + day.payments + day.tickets, 0);
  const ticketAmount = chartData.reduce((sum, day) => sum + day.tickets, 0);

  // Calcul de l'évolution (simplifié)
  const lastPeriod = chartData.slice(-14); // 2 semaines
  const currentPeriodTotal = lastPeriod.slice(-7).reduce((sum, day) => sum + day.payments + day.tickets, 0);
  const previousPeriodTotal = lastPeriod.slice(0, 7).reduce((sum, day) => sum + day.payments + day.tickets, 0);
  const changePercentage = previousPeriodTotal > 0 
    ? Math.round(((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100)
    : 0;

  return (
    <div className="flex min-h-screen bg-[#0d1a23]">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 space-y-6">
          <DashboardContent gymId={id} />
          
          <RevenueChart 
            data={chartData}
            totalAmount={totalAmount}
            changePercentage={changePercentage}
            ticketAmount={ticketAmount}
          />
        </main>
      </div>
    </div>
  );
}