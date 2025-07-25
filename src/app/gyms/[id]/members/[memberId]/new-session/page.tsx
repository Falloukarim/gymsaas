import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-4 py-4">
      <Card className="bg-gray-800 text-white border-gray-700">
        <CardHeader className="border-b border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/gyms/${gymId}/members/${memberId}`}
                className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Retour au profil</span>
              </Link>
              
              <div className="sm:hidden flex items-center gap-2 text-blue-400">
                <Calendar className="h-4 w-4" />
                <span>Session</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <CardTitle className="text-xl sm:text-2xl font-bold">Nouvel accès ponctuel</CardTitle>
              <CardDescription className="text-gray-400">
                Pour {member.full_name} • {member.gyms?.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {sessions.length > 0 ? (
            <div className="space-y-6">
              <SessionCreationForm
                member={member}
                gymId={gymId}
                sessions={sessions}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 mb-4">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Aucune session disponible</h3>
              <p className="text-gray-400 mb-6">
                Créez des sessions pour permettre des accès ponctuels à votre salle
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline" className="px-6">
                  <Link href={`/gyms/${gymId}/subscriptions`}>
                    Créer une session
                  </Link>
                </Button>
                <Button asChild className="px-6">
                  <Link href={`/gyms/${gymId}/members/${memberId}/renew`}>
                    Voir les abonnements
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