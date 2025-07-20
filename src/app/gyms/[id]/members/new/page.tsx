import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MemberForm } from '@/components/members/MemberForm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  // Vérifier l'accès au gym
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

  // Récupérer les infos du gym
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link
        href={`/gyms/${gymId}/dashboard`}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#00c9a7] hover:text-[#00a58e] transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au dashboard
      </Link>

      <Card className="bg-[#0d1a23] border border-gray-700 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Nouveau membre pour {gym?.name || 'votre salle'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <MemberForm 
            gymId={gymId}
            subscriptions={subscriptions || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
