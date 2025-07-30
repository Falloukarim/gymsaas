'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface SubscriptionStatusProps {
  gymId: string;
}

interface Status {
  active: boolean;
  isTrial: boolean;
  trialEndDate?: string;
}

export default function SubscriptionStatus({ gymId }: SubscriptionStatusProps) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('subscription_active, trial_end_date')
        .eq('id', gymId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du statut d’abonnement:', error);
        return;
      }

      const isTrialActive =
        data.trial_end_date && new Date(data.trial_end_date) > new Date();

      setStatus({
        active: data.subscription_active,
        isTrial: isTrialActive,
        trialEndDate: data.trial_end_date,
      });
    };

    fetchStatus();

    const subscription = supabase
      .channel('subscription-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'gyms',
          filter: `id=eq.${gymId}`,
        },
        (payload) => {
          const isTrialActive =
            payload.new.trial_end_date &&
            new Date(payload.new.trial_end_date) > new Date();

          setStatus({
            active: payload.new.subscription_active,
            isTrial: isTrialActive,
            trialEndDate: payload.new.trial_end_date,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [gymId]);

  if (!status) {
    return <div className="p-4">Chargement du statut...</div>;
  }

  if (status.isTrial && status.trialEndDate) {
    const daysLeft = Math.ceil(
      (new Date(status.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Période d'essai active</strong>
        <span className="block sm:inline">
          {' '}
          Il vous reste {daysLeft} jour{daysLeft > 1 ? 's' : ''} d'essai gratuit.
        </span>
      </div>
    );
  }

  if (!status.active) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Abonnement inactif !</strong>
        <span className="block sm:inline">
          {' '}
          Votre accès à l'application est limité.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
      <strong className="font-bold">Abonnement actif</strong>
      <span className="block sm:inline">
        {' '}
        Votre accès à l'application est complet.
      </span>
    </div>
  );
}
