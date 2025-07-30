// pages/api/cron/check-subscriptions.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // 1. Vérifier les essais expirés
    const now = new Date().toISOString();
    
    // Récupérer les gyms dont l'essai est terminé mais pas encore désactivés
    const { data: expiredTrials, error: trialError } = await supabase
      .from('gyms')
      .select('id')
      .lt('trial_end_date', now)
      .eq('subscription_active', true)
      .eq('trial_used', true);

    if (trialError) throw trialError;

    // Désactiver ces gyms
    if (expiredTrials && expiredTrials.length > 0) {
      const gymIds = expiredTrials.map(g => g.id);
      const { error: updateError } = await supabase
        .from('gyms')
        .update({ subscription_active: false })
        .in('id', gymIds);

      if (updateError) throw updateError;
    }

    // 2. Vérifier les abonnements payants expirés (comme avant)
    const { data: activePayments, error: paymentsError } = await supabase
      .from('gym_subscription_payments')
      .select('gym_id')
      .eq('status', 'completed')
      .lte('end_date', now);

    if (paymentsError) throw paymentsError;

    const gymIdsToDeactivate = activePayments.map(p => p.gym_id);
    
    if (gymIdsToDeactivate.length > 0) {
      const { error: gymError } = await supabase
        .from('gyms')
        .update({ subscription_active: false })
        .in('id', gymIdsToDeactivate);

      if (gymError) throw gymError;
    }

    return res.status(200).json({ 
      message: 'Subscription check completed',
      expired_trials: expiredTrials?.length || 0,
      expired_subscriptions: activePayments?.length || 0
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({ error: error.message });
  }
}