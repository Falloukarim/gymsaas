import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, CreditCard } from 'lucide-react';
import SubscriptionRenewalForm from '@/components/members/SubscriptionRenewalForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SubscriptionType {
  id: string;
  type: string;
  price: number;
  duration_days: number;
}

interface MemberSubscription {
  id: string;
  end_date: string;
  status: string;
  subscriptions: SubscriptionType;
}

interface GymInfo {
  id: string;
  name: string;
}

interface Member {
  id: string;
  full_name: string;
  email?: string | null;
  phone: string;
  avatar_url?: string | null;
  gyms: GymInfo | null;
  member_subscriptions?: MemberSubscription[];
}

interface Subscription {
  id: string;
  type: string;
  price: number;
  duration_days: number;
  is_session: boolean;
  [key: string]: any;
}

export default async function RenewSubscriptionPage({
  params,
}: {
  params: { id: string; memberId: string };
}) {
  const { id: gymId, memberId } = params;

  if (!gymId || !memberId) {
    console.error('Missing gymId or memberId');
    redirect('/gyms');
  }

  const supabase = createClient();

  try {
    // Fetch member data
    const { data: member, error: memberError } = await (await supabase)
      .from('members')
      .select(`
        id,
        full_name,
        email,
        phone,
        avatar_url,
        gyms(id, name),
        member_subscriptions(
          id,
          end_date,
          status,
          subscriptions(
            id,
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
      .select('id, type, price, duration_days, is_session')
      .eq('gym_id', gymId)
      .eq('is_session', false)
      .order('price', { ascending: true });

    if (subscriptionsError || !subscriptions) {
      console.error('Error fetching subscriptions:', subscriptionsError);
      return notFound();
    }

    // Get current active subscription
    const activeSubscription = member.member_subscriptions?.find(
      (sub: { end_date: string | number | Date; }) => new Date(sub.end_date) > new Date()
    );

    // Helper function for avatar fallback
    const getAvatarFallback = (name: string) => {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
        <Card className="bg-gray-800 text-white border-gray-700">
          {/* Header Section */}
          <CardHeader className="border-b border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <Link
                href={`/gyms/${gymId}/members/${memberId}`}
                className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors w-fit"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour au profil du membre</span>
              </Link>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={member.avatar_url || undefined} 
                    alt={`Avatar de ${member.full_name}`}
                  />
                  <AvatarFallback className="bg-gray-600">
                    {getAvatarFallback(member.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">Renouveler l&apos;abonnement</h1>
                  <p className="text-sm text-gray-400">
                    <p className="text-sm text-gray-400">
  {member.full_name} - {(member.gyms as any)?.name || 'Salle inconnue'}
</p>
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Main Content */}
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {activeSubscription && (
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg">Abonnement actuel</CardTitle>
                    <CardDescription className="text-gray-300">
                      Cet abonnement sera prolongé ou remplacé
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
                      <div>
                        <p className="font-medium capitalize">
                     {(activeSubscription.subscriptions as any).type}
                        </p>
                        <p className="text-sm text-gray-300">
                          Valide jusqu&apos;au {new Date(activeSubscription.end_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xl sm:text-2xl font-bold">
                          {(activeSubscription.subscriptions as any).price.toLocaleString('fr-FR')} F CFA                        </p>
                        <p className="text-sm text-gray-300">
                          {(activeSubscription.subscriptions as any).duration_days}jours
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gray-700 border-gray-600">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg">Nouvel abonnement</CardTitle>
                  <CardDescription className="text-gray-300">
                    Choisissez un nouveau type d&apos;abonnement
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {subscriptions.length > 0 ? (
                    <SubscriptionRenewalForm
                      member={member}
                      gymId={gymId}
                      subscriptions={subscriptions}
                      currentSubscription={activeSubscription as any}
                    />
                  ) : (
                    <div className="text-center py-6 sm:py-8">
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