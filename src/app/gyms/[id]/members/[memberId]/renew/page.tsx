import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, CreditCard } from 'lucide-react';
import SubscriptionRenewalForm from '@/components/members/SubscriptionRenewalForm';

export default async function RenewSubscriptionPage({
  params: resolvedParams,
}: {
  params: Promise<{ id: string; memberId: string }>;
}) {
  const params = await resolvedParams;
  const { id: gymId, memberId } = params;

  const supabase = createClient();

  // Fetch member data
  const { data: member, error: memberError } = await (await supabase)
    .from('members')
    .select('*, gyms(name), member_subscriptions(*, subscriptions(*))')
    .eq('id', memberId)
    .single();

  if (memberError || !member) {
    return notFound();
  }

  // Fetch available subscriptions for this gym
  const { data: subscriptions, error: subscriptionsError } = await (await supabase)
    .from('subscriptions')
    .select('*')
    .eq('gym_id', gymId)
    .eq('is_session', false)
    .order('price', { ascending: true });

  if (subscriptionsError) {
    console.error('Error fetching subscriptions:', subscriptionsError);
    return notFound();
  }

  // Get current active subscription if exists
  const activeSubscription = member.member_subscriptions?.find(
    (sub: { end_date: string | number | Date }) => new Date(sub.end_date) > new Date()
  );

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
                <h1 className="text-xl sm:text-2xl font-bold">Renouveler l&apos;abonnement</h1>
                <p className="text-sm text-gray-400">{member.full_name} - {member.gyms?.name}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Main Content */}
        <CardContent className="p-6">
          <div className="space-y-6">
            {activeSubscription && (
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg">Abonnement actuel</CardTitle>
                  <CardDescription className="text-gray-300">
                    Cet abonnement sera prolongé ou remplacé
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{activeSubscription.subscriptions?.type}</p>
                      <p className="text-sm text-gray-300">
                        Valide jusqu&apos;au {new Date(activeSubscription.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {activeSubscription.subscriptions?.price} F CFA
                      </p>
                      <p className="text-sm text-gray-300">
                        {activeSubscription.subscriptions?.duration_days} jours
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg">Nouvel abonnement</CardTitle>
                <CardDescription className="text-gray-300">
                  Choisissez un nouveau type d&apos;abonnement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions.length > 0 ? (
                  <SubscriptionRenewalForm
                    member={member}
                    gymId={gymId}
                    subscriptions={subscriptions}
                    currentSubscription={activeSubscription}
                  />
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-400">Aucun abonnement disponible pour cette salle</p>
                    <Button className="mt-4" asChild>
                      <Link href={`/gyms/${gymId}/subscriptions`}>
                        Créer un abonnement
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