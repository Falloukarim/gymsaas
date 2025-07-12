'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteSubscription(
  subscriptionId: string
): Promise<{ error?: string }> {
  const supabase = createClient();

  // Vérifier les membres utilisant cet abonnement
  const { count: membersCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_id', subscriptionId);

  if (membersCount && membersCount > 0) {
    return { error: 'Subscription is in use by members' };
  }

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', subscriptionId);

  if (error) return { error: error.message };

  revalidatePath('/subscriptions');
  redirect('/subscriptions');
}