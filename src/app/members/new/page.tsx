import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MemberForm } from '@/components/members/MemberForm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

type SearchParams = Promise<{ gym_id?: string }>;

export default async function NewMemberPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedParams = await searchParams;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: gyms } = await supabase
    .from('gyms')
    .select('id, name')
    .eq('owner_id', user.id);

  // Choisir gym_id depuis searchParams ou premier gym trouvé
  const gymId = resolvedParams.gym_id || gyms?.[0]?.id || '';

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, name')
    .eq('gym_id', gymId);

  console.log("gymId:", gymId);
  console.log("subscriptions:", subscriptions);

  return (
    <div className="space-y-6">
      <Link
        href={gymId ? `/gyms/${gymId}` : '/members'}
        className="flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <h1 className="text-2xl font-bold">Nouveau membre</h1>

      <MemberForm 
        gymId={gymId}
        gyms={gyms || []}
        subscriptions={subscriptions || []}
      />
    </div>
  );
}
