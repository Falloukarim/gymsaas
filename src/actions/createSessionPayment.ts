'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createSessionPayment(params: {
  member_id: string;
  subscription_id: string;
  gym_id: string;
}) {
  const supabase = createClient();
  
  try {
    // 1. Récupérer le prix de la session depuis la base
    const { data: session, error: sessionError } = await (await supabase)
      .from('subscriptions')
      .select('price')
      .eq('id', params.subscription_id)
      .single();

    if (sessionError || !session) {
      throw new Error(sessionError?.message || 'Session introuvable');
    }

    // 2. Créer le paiement
    const { error: paymentError } = await (await supabase)
      .from('payments')
      .insert({
        member_id: params.member_id,
        amount: session.price,
        type: 'session',
        subscription_id: params.subscription_id,
        gym_id: params.gym_id,
        status: 'paid',
        payment_method: 'cash'
      });

    if (paymentError) throw paymentError;

    // 3. Créer l'accès session (valable 1 jour)
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const { error: accessError } = await (await supabase)
      .from('member_subscriptions')
      .insert({
        member_id: params.member_id,
        subscription_id: params.subscription_id,
        gym_id: params.gym_id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active'
      });

    if (accessError) throw accessError;

    // 4. Journaliser l'accès
    const { error: logError } = await (await supabase)
      .from('access_logs')
      .insert({
        member_id: params.member_id,
        gym_id: params.gym_id,
        access_granted: true,
        access_method: 'manual'
      });

    if (logError) console.error('Erreur de journalisation:', logError);

    // 5. Rafraîchir les données
    revalidatePath(`/gyms/${params.gym_id}/members/${params.member_id}`);
    
    return { success: true };
  } catch (error) {
    console.error('Erreur complète:', error);
    return { 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
}