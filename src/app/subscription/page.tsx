import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionCard } from '@/components/SubscriptionCard';

export default async function SubscriptionPage() {
  const cookieStore = cookies();
  const supabase = createClient();

  // Récupérer l'utilisateur
  const { data: { user }, error: authError } = await (await supabase).auth.getUser();
  
  if (authError || !user) {
    redirect('/auth/login');
  }

  try {
    // Récupérer le gym de l'utilisateur
    const { data: gymUser, error: gymUserError } = await (await supabase)
      .from('gbus')
      .select('gym_id')
      .eq('user_id', user.id)
      .single();

    if (gymUserError || !gymUser) throw new Error('Gym not found');

    // Récupérer les détails du gym
    const { data: gym, error: gymError } = await (await supabase)
      .from('gyms')
      .select('trial_end_date, subscription_active, trial_used')
      .eq('id', gymUser.gym_id)
      .single();

    if (gymError || !gym) throw gymError || new Error('Gym details not found');

    // Si abonnement actif, rediriger vers le dashboard
    if (gym.subscription_active) {
      redirect('/dashboard');
    }

    // Récupérer uniquement les abonnements payants (non trial)
    const { data: paidSubscriptions, error: plansError } = await (await supabase)
      .from('gym_subscriptions')
      .select('*')
      .eq('gym_id', gymUser.gym_id)
      .eq('is_trial', false);

    if (plansError) throw plansError;

    // Calcul des jours restants
    const daysLeft =
      gym.trial_end_date && !gym.trial_used
        ? Math.ceil((new Date(gym.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Abonnement</h1>
            
            {daysLeft > 0 ? (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-blue-700">
                  Votre période d&apos;essai gratuit se termine dans {Math.floor(daysLeft)} jours.
                </p>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400">
                <p className="text-red-700">
                  Votre période d&apos;essai est terminée. Veuillez choisir un abonnement.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {paidSubscriptions?.map((plan) => (
              <SubscriptionCard 
                key={plan.id}
                plan={plan}
                gymId={gymUser.gym_id}
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
