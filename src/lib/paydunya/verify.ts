import { createClient } from "../supabaseClient";

export async function verifyActiveSubscriptions() {
  const supabase = createClient();
  
  // Récupérer les gyms avec abonnement expiré
  const { data: expiredGyms } = await supabase
    .from('gyms')
    .select('id, current_subscription_id')
    .lt('trial_end_date', new Date().toISOString())
    .eq('subscription_active', true);

  for (const gym of expiredGyms || []) {
    // Vérifier paiement chez Paydunya
    const { data: lastPayment } = await supabase
      .from('gym_subscription_payments')
      .select('payment_id, status')
      .eq('gym_id', gym.id)
      .order('created_at', { descending: true })
      .limit(1);

    const isActive = lastPayment?.[0]?.status === 'completed';
    
    await supabase
      .from('gyms')
      .update({ subscription_active: isActive })
      .eq('id', gym.id);
  }
}