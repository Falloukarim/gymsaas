'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteMember(memberId: string): Promise<{ error?: string }> {
  const supabase = createClient();

  // Vérifier les dépendances avant suppression
  const { count: subscriptionsCount } = await (await supabase)
    .from('member_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', memberId);

  if (subscriptionsCount && subscriptionsCount > 0) {
    return { error: 'Member has active subscriptions' };
  }

  const { error } = await (await supabase)
    .from('members')
    .delete()
    .eq('id', memberId);

  if (error) return { error: error.message };

  revalidatePath('/members');
  redirect('/members');
}