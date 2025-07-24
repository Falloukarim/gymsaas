import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SessionCreationForm from '@/components/members/SessionCreationForm';
import { Button } from '@/components/ui/button';

export default async function NewSessionPage({
  params: resolvedParams,
}: {
  params: Promise<{ id: string; memberId: string }>;
}) {
  const { id: gymId, memberId } = await resolvedParams;

  const supabase = createClient();

  // 🔎 Fetch member data
  const { data: member, error: memberError } = await (await supabase)
    .from('members')
    .select('*, gyms(name)')
    .eq('id', memberId)
    .single();

  if (memberError || !member) {
    return notFound();
  }

  // 🔎 Fetch available sessions for this gym
  const { data: sessions, error: sessionsError } = await (await supabase)
    .from('subscriptions')
    .select('*')
    .eq('gym_id', gymId)
    .eq('is_session', true)
    .order('price', { ascending: true });

  if (sessionsError) {
    console.error('Error fetching sessions:', sessionsError);
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <Card className="bg-gray-800 text-white border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center gap-4">
            <Link
              href={`/gyms/${gymId}/members/${memberId}`}
              className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour au profil du membre</span>
            </Link>

            <div>
              <CardTitle className="text-xl sm:text-2xl">Nouvel accès ponctuel</CardTitle>
              <p className="text-sm text-gray-400">
                {member.full_name} - {member.gyms?.name}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {sessions.length > 0 ? (
            <SessionCreationForm
              member={member}
              gymId={gymId}
              sessions={sessions}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Aucune session disponible pour cette salle</p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href={`/gyms/${gymId}/subscriptions`}>Créer une session</Link>
                </Button>
                <Button asChild>
                  <Link href={`/gyms/${gymId}/members/${memberId}/renew`}>
                    Créer un abonnement
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
