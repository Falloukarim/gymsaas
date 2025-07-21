import { createClient } from '@/utils/supabase/server';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from 'next/navigation';
import { AnimatedCards } from "@/components/animated-cards";
import { AnimatedSubscriptions, AnimatedEntries } from "@/components/animated-lists";
import { AnimatedRevenueChart } from "@/components/animated-chart";
import { AddMemberButton } from '@/components/buttons/AddMemberButton';
import { RevenueChart } from '@/components/revenue-chart';

type Member = { full_name: string };
type Subscription = { name: string };
type MemberSubscription = {
  id: string;
  start_date: string;
  end_date: string;
  amount: number;
  members: Member;
  subscriptions: Subscription;
};
type AccessLog = {
  id: string;
  timestamp: string;
  access_granted: boolean;
  members: Member;
};

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

  if (authError || !user) redirect('/login');

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
      (await supabase)
        .from('member_subscriptions')
        .select('*', { count: 'exact' })
        .eq('gym_id', params.id)
        .gte('end_date', currentDate),
      // Abonnements INACTIFS (end_date < aujourd'hui)
      (await supabase)
        .from('member_subscriptions')
        .select('*', { count: 'exact' })
        .eq('gym_id', params.id)
        .lt('end_date', currentDate),
      (await supabase)
        .from('payments')
        .select('amount, created_at')
        .eq('gym_id', params.id)
        .eq('status', 'paid')
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .lte('created_at', new Date(new Date().setHours(23, 59, 59, 999)).toISOString()),
      (await supabase)
        .from('payments')
        .select('amount, created_at')
        .eq('gym_id', params.id)
        .eq('status', 'paid')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .lte('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999).toISOString()),
      (await supabase)
        .from('access_logs')
        .select('*', { count: 'exact' })
        .eq('gym_id', params.id)
        .gte('timestamp', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .lte('timestamp', new Date(new Date().setHours(23, 59, 59, 999)).toISOString()),
      (await supabase)
        .from('member_subscriptions')
        .select(`*, members(full_name), subscriptions(name)`)
        .eq('gym_id', params.id)
        .order('start_date', { ascending: false })
        .limit(5),
      (await supabase)
        .from('access_logs')
        .select(`*, members(full_name)`)
        .eq('gym_id', params.id)
        .order('timestamp', { ascending: false })
        .limit(5),
      (await supabase)
        .from('gyms')
        .select('name, address')
        .eq('id', params.id)
        .single(),
     (await supabase)
  .from('payments')
  .select('amount, created_at')
  .eq('gym_id', params.id)
  .eq('status', 'paid')
  .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  .order('created_at', { ascending: true })
        
    ]);

    // Calcul des totaux
    const todayRevenueTotal = todayPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    const monthlyRevenueTotal = monthlyPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
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

    const stats = [
      { 
        name: "Abonnements actifs", 
        value: activeSubscriptions?.toString() || "0", 
        iconName: "CreditCard",
        change: "+0%", 
        changeType: "positive" 
      },
      { 
        name: "Abonnements inactifs", 
        value: inactiveSubscriptions?.toString() || "0", 
        iconName: "Users",
        change: "+0%", 
        changeType: "positive" 
      },
      { 
        name: "Revenu du jour", 
        value: formatCurrency(todayRevenueTotal), 
        iconName: "Euro",
        change: "+0%", 
        changeType: "positive" 
      },
      { 
        name: "Revenus mensuels", 
        value: formatCurrency(monthlyRevenueTotal), 
        iconName: "Activity",
        change: "+0%", 
        changeType: "positive" 
      },
      { 
        name: "Entrées aujourd'hui", 
        value: todayEntries?.toString() || "0", 
        iconName: "Clock",
        change: "+0%", 
        changeType: "positive" 
      },
    ];


    return (
      <div className="flex min-h-screen bg-[#0d1a23]">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold">{gym?.name}</CardTitle>
                    <p className="text-sm text-gray-300">{gym?.address}</p>
                    </div>
                   <AddMemberButton gymId={params.id} />
                      </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <AnimatedCards stats={stats} />
               <RevenueChart data={chartData} />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Card className="border-gray-700 bg-[#0d1a23]">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Derniers abonnements</span>
                        <Link href={`/gyms/${params.id}/subscriptions`} className="text-sm font-normal text-[#00c9a7] hover:text-[#00a58e]">
                          Voir tous →
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AnimatedSubscriptions 
                        subscriptions={recentSubscriptions as MemberSubscription[]} 
                        gymId={params.id} 
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-gray-700 bg-[#0d1a23]">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Dernières entrées</span>
                        <Link href={`/gyms/${params.id}/access-logs`} className="text-sm font-normal text-[#00c9a7] hover:text-[#00a58e]">
                          Voir tous →
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AnimatedEntries 
                        entries={recentEntries as AccessLog[]} 
                        gymId={params.id} 
                      />
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    return (
      <div className="flex min-h-screen bg-[#0d1a23]">
        <div className="flex-1 flex flex-col">
          <div className="p-6">
            <Card className="border-0 bg-red-900/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Erreur</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Une erreur est survenue lors du chargement des données.</p>
                <Button 
                  className="mt-4 bg-[#00c9a7] hover:bg-[#00a58e] text-white"
                  onClick={() => window.location.reload()}
                >
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}