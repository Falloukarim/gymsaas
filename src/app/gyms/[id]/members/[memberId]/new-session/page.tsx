import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import SessionCreationForm from '@/components/members/SessionCreationForm';

export default async function NewSessionPage({
  params,
}: {
  params: { id: string; memberId: string };
}) {
  const supabase = createClient();
  const { id: gymId, memberId } = params;

  // Fetch member data
  const { data: member, error: memberError } = await (await supabase)
    .from('members')
    .select('*, gyms(name)')
    .eq('id', memberId)
    .single();

  if (memberError || !member) {
    return notFound();
  }

  // Fetch available sessions for this gym
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
        {/* Header Section */}
        <CardHeader className="border-b border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/gyms/${gymId}/members/${memberId}`}
                className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour au profil du membre</span>
              </Link>
              
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Nouvelle session</h1>
                <p className="text-sm text-gray-400">{member.full_name} - {member.gyms?.name}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Main Content */}
        <CardContent className="p-6">
          <div className="space-y-6">
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg">Sessions disponibles</CardTitle>
                <CardDescription className="text-gray-300">
                  Choisissez une session pour ce membre
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <SessionCreationForm
                    member={member}
                    gymId={gymId}
                    sessions={sessions}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-400">Aucune session disponible pour cette salle</p>
                    <Button className="mt-4" asChild>
                      <Link href={`/gyms/${gymId}/subscriptions`}>
                        Créer une session
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}