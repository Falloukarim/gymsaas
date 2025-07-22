import { redirect } from 'next/navigation';
import ScanResultClient from '@/components/ScanResultClient';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ gymId: string }>;
  searchParams: Promise<{ name?: string; status?: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return {
    title: `Résultat du scan - ${resolvedSearchParams.name || 'Membre'}`,
  };
}


export default async function ScanResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ gymId: string }>;
  searchParams: Promise<{ name?: string; status?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { gymId } = resolvedParams;
  const { name, status } = resolvedSearchParams;

  const supabase = createClient();

  // 1. Validation des paramètres
  if (!name || !status || !['active', 'inactive'].includes(status)) {
    redirect(`/scan/${gymId}`);
  }

  // 2. Vérification de la salle de sport
  const { data: gym, error } = await (await supabase)
    .from('gyms')
    .select('name')
    .eq('id', gymId)
    .single();

  if (error || !gym) {
    redirect('/dashboard');
  }

  // 3. Formatage des données pour le client
  const resultData = {
    memberName: decodeURIComponent(name),
    accessStatus: status === 'active' ? 'granted' : 'denied',
    gymName: gym.name,
    timestamp: new Date().toLocaleString('fr-FR'),
    gymId,
  };

  return (
    <div className="max-w-3xl mx-auto p-6 overflow-x-hidden">
<ScanResultClient
  name={decodeURIComponent(name)}
  status={status}
  gymId={gymId}
/>
    </div>
  );
}
