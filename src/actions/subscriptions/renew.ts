// src/actions/subscriptions/renew.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// src/actions/subscriptions/renew.ts
export async function renewSubscription(
  memberId: string,
  gymId: string,
  subscriptionId: string
) {
  const supabase = createClient();

  try {
    // 1. Récupérer les détails de l'abonnement
    const { data: subscription, error: subError } = await (await supabase)
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      throw new Error('Abonnement non trouvé');
    }

    // 2. Calculer la date de fin CORRECTEMENT
    const endDate = new Date();
    
    // Désactiver l'ancien abonnement
    const { error: expireError } = await (await supabase)
      .from('member_subscriptions')
      .update({ status: 'expired' })
      .eq('member_id', memberId)
      .eq('status', 'active');

    if (expireError) throw expireError;

    // Pour les ABONNEMENTS (pas les sessions)
    if (!subscription.is_session) {
      endDate.setDate(endDate.getDate() + subscription.duration_days);
      
      // Créer le nouvel abonnement
      const { error: insertError } = await (await supabase)
        .from('member_subscriptions')
        .insert({
          member_id: memberId,
          subscription_id: subscriptionId,
          gym_id: gymId,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          status: 'active'
        });

      if (insertError) throw insertError;

      // Enregistrer le paiement
      const { error: paymentError } = await (await supabase)
        .from('payments')
        .insert({
          member_id: memberId,
          gym_id: gymId,
          amount: subscription.price,
          type: 'subscription',
          subscription_id: subscriptionId,
          status: 'paid',
          payment_method: 'cash'
        });

      if (paymentError) throw paymentError;

      // Mettre à jour le membre
      const { error: memberError } = await (await supabase)
        .from('members')
        .update({
          has_subscription: true,
          updated_at: new Date().toISOString(),
          qr_code: `GYM-${memberId}-${Date.now()}`
        })
        .eq('id', memberId);

      if (memberError) throw memberError;

      revalidatePath(`/gyms/${gymId}/members/${memberId}`);
      return { success: true };
    } else {
      throw new Error('Le renouvellement ne s\'applique pas aux sessions');
    }
  } catch (error) {
    console.error('Renewal error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
}