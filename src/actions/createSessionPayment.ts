'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createSessionPayment({
  member_id,
  amount,
  subscription_id,
  gym_id
}: {
  member_id: string;
  amount: number;
  subscription_id: string;
  gym_id: string;
}) {
  const supabase = createClient();
  
  const paymentData = {
    member_id,
    amount,
    type: 'session',
    subscription_id,
    gym_id,
    created_at: new Date().toISOString(),
    status: 'paid',
    payment_method: 'cash'
  };

  if (!paymentData.member_id || !paymentData.amount || !paymentData.subscription_id) {
    return { error: 'Données requises manquantes' };
  }

  try {
    // Créer d'abord le paiement
    const { data: payment, error: paymentError } = await (await supabase)
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Créer l'accès session (1 jour seulement)
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const { error: subscriptionError } = await (await supabase)
      .from('member_subscriptions')
      .insert({
        member_id,
        subscription_id,
        gym_id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active'
      });

    if (subscriptionError) throw subscriptionError;

    // Ne PAS mettre à jour le QR code ou générer de badge
    revalidatePath(`/gyms/${gym_id}/members/${member_id}`);
    return { success: true, payment };
  } catch (error) {
    console.error('Error creating session payment:', error);
    return { error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}