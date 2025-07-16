import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MemberForm } from '@/components/members/MemberForm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function NewMemberPage({ 
  params: resolvedParams 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id: gymId } = await resolvedParams;

  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Vérifier que l'utilisateur a accès à ce gym
  const { data: gbus, error } = await (await supabase)
    .from('gbus')
    .select()
    .eq('gym_id', gymId)
    .eq('user_id', user.id)
    .single();

  if (error || !gbus) {
    console.error("Accès non autorisé", { gymId, userId: user.id });
    redirect('/gyms/new');
  }

  // Récupérer les infos du gym (pour le titre)
  const { data: gym } = await (await supabase)
    .from('gyms')
    .select('name')
    .eq('id', gymId)
    .single();

  // Récupérer les abonnements disponibles
 const { data: subscriptions } = await (await supabase)
  .from('subscriptions')
  .select('id, type, price')
  .eq('gym_id', gymId);



  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <Link
        href={`/gyms/${gymId}/dashboard`}
        className="flex items-center gap-2 text-sm text-[#00c9a7] hover:text-[#00a58e]"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au dashboard
      </Link>

      <h1 className="text-2xl font-bold">
        Nouveau membre pour {gym?.name || 'votre salle'}
      </h1>

      <MemberForm 
        gymId={gymId}
        subscriptions={subscriptions || []}
      />
    </div>
  );
}