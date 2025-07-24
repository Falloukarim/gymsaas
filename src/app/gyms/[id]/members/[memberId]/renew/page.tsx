import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, CreditCard } from 'lucide-react';
import SubscriptionRenewalForm from '@/components/members/SubscriptionRenewalForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MemberSubscription {
  id: string;
  end_date: string;
  status: string;
  subscriptions: {
    type: string;
    price: number;
    duration_days: number;
  };
}

interface Member {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  avatar_url?: string | null;
  gyms: {
    name: string;
  } | null;
  member_subscriptions?: MemberSubscription[];
}

export default async function RenewSubscriptionPage({
  params: resolvedParams,
}: {
  params: Promise<{ id: string; memberId: string }>;
}) {
  const params = await resolvedParams;
  const { id: gymId, memberId } = params;

  if (!gymId || !memberId) {
    console.error('Missing gymId or memberId');
    redirect('/gyms');
  }

  const supabase = createClient();

  try {
    // Fetch member data with avatar_url
    const { data: member, error: memberError } = await (await supabase)
      .from('members')
      .select(`
        id,
        full_name,
        email,
        phone,
        avatar_url,
        gyms(name),
        member_subscriptions(
          *,
          subscriptions(
            type,
            price,
            duration_days
          )
        )
      `)
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      console.error('Member not found:', memberError);
      return notFound();
    }

    // Fetch available subscriptions
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

    // Get current active subscription
    const activeSubscription = member.member_subscriptions?.find(
      (sub) => new Date(sub.end_date) > new Date()
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

                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={member.avatar_url || undefined} 
                      alt={`Avatar de ${member.full_name}`}
                    />
                    <AvatarFallback className="bg-gray-600">
                      {member.full_name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Renouveler l&apos;abonnement</h1>
                    <p className="text-sm text-gray-400">
                      {member.full_name} - {member.gyms?.name || 'Salle inconnue'}
                    </p>
                  </div>
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
                        <p className="font-medium capitalize">
                          {activeSubscription.subscriptions?.type}
                        </p>
                        <p className="text-sm text-gray-300">
                          Valide jusqu&apos;au {new Date(activeSubscription.end_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {activeSubscription.subscriptions?.price.toLocaleString('fr-FR')} F CFA
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
  } catch (error) {
    console.error('Error in RenewSubscriptionPage:', error);
    return notFound();
  }
}