import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionCard } from '@/components/SubscriptionCard';

export default async function SubscriptionPage() {
  const cookieStore = cookies();
  const supabase = createClient();

  // Récupérer l'utilisateur
  const { data: { user } } = await (await supabase).auth.getUser();
  if (!user) redirect('/auth/login');

  try {
    // Récupérer le gym de l'utilisateur
    const { data: gymUser } = await (await supabase)
      .from('gbus')
      .select('gym_id')
      .eq('user_id', user.id)
      .single();

    if (!gymUser) throw new Error('Gym not found');

    // Récupérer les détails du gym
    const { data: gym } = await (await supabase)
      .from('gyms')
      .select('trial_end_date, subscription_active, trial_used')
      .eq('id', gymUser.gym_id)
      .single();

    if (!gym) throw new Error('Gym details not found');

    // Redirection si abonnement actif
    if (gym.subscription_active) redirect('/dashboard');

    // Récupérer les abonnements payants
    const { data: paidSubscriptions } = await (await supabase)
      .from('gym_subscriptions')
      .select('*')
      .eq('gym_id', gymUser.gym_id)
      .eq('is_trial', false);

    // Calcul des jours restants
    const daysLeft = gym.trial_end_date && !gym.trial_used
      ? Math.ceil((new Date(gym.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Choisissez Votre Abonnement
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sélectionnez le forfait qui correspond à vos besoins et accédez à toutes les fonctionnalités premium.
            </p>

            {daysLeft > 0 ? (
              <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-200">
                <span className="text-blue-800 font-medium">
                  ⏳ Essai gratuit: {Math.floor(daysLeft)} jour{Math.floor(daysLeft) > 1 ? 's' : ''} restant{Math.floor(daysLeft) > 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-amber-100 border border-amber-200">
                <span className="text-amber-800 font-medium">
                  ⌛ Votre essai gratuit est terminé
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {paidSubscriptions?.map((plan) => (
              <SubscriptionCard 
                key={plan.id}
                plan={plan}
                gymId={gymUser.gym_id}
                isPopular={plan.billing_cycle === 'monthly'} // Exemple: marquer l'abonnement mensuel comme populaire
              />
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Subscription page error:', error);
    redirect('/error');
  }
}