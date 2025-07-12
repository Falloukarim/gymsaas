'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function processRefund(
  paymentId: string
): Promise<{ error?: string }> {
  const supabase = createClient();

  // Vérifier que le paiement existe et n'est pas déjà remboursé
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (!payment) return { error: 'Payment not found' };

  const { error } = await supabase
    .from('payments')
    .update({ refunded_at: new Date().toISOString() })
    .eq('id', paymentId);

  if (error) return { error: error.message };

  revalidatePath('/payments');
  revalidatePath(`/members/${payment.member_id}`);
  redirect('/payments');
}