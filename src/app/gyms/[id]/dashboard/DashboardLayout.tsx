import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import SubscriptionStatus from '@/components/SubscriptionStatus';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [gymId, setGymId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      setIsLoading(true);
      try {
        // 1. Vérifier l'authentification
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          return router.push('/login');
        }

        // 2. Récupérer le gym associé à l'utilisateur
        const { data: gymUser, error: gymUserError } = await supabase
          .from('gbus')
          .select('gym_id')
          .eq('user_id', user.id)
          .single();

        if (gymUserError || !gymUser) {
          return router.push('/subscription');
        }

        setGymId(gymUser.gym_id);

        // 3. Vérifier le statut de l'abonnement
        const { data: gym, error: gymError } = await supabase
          .from('gyms')
          .select(`
            subscription_active, 
            current_subscription_id,
            current_subscription_end,
            trial_end_date,
            trial_used
          `)
          .eq('id', gymUser.gym_id)
          .single();

        if (gymError || !gym) {
          return router.push('/subscription');
        }

        // 4. Vérifier la période d'essai
        const isTrialExpired = gym.trial_used && new Date(gym.trial_end_date) < new Date();
        
        // 5. Vérifier l'abonnement payant
        const isPaidSubscriptionActive = gym.subscription_active && 
                                       gym.current_subscription_id && 
                                       new Date(gym.current_subscription_end) >= new Date();

        // 6. Rediriger si nécessaire
        if (!isPaidSubscriptionActive && isTrialExpired) {
          return router.push('/subscription');
        }

      } catch (error) {
        console.error('Error checking subscription:', error);
        router.push('/subscription');
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Vérification de votre abonnement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {gymId && <SubscriptionStatus gymId={gymId} />}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}