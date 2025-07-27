// src/app/gyms/[id]/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';
import { RevenueComparisonChart } from '@/components/dashboard/RevenueComparisonChart';
import { getRevenueComparison } from '@/lib/queries/getRevenueComparison';
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
  const gymId = await getGymIdForCurrentUser(); // ou récupéré depuis session/user
  const chartData = await getRevenueComparison(gymId);
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

  return (
    <div className="flex min-h-screen bg-[#0d1a23]">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">
          <DashboardContent gymId={id} />
           <div className="grid grid-cols-1 gap-4">
      <RevenueComparisonChart data={chartData} />
    </div>
        </main>
      </div>
    </div>
  );
}