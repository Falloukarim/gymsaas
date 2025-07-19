'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createSessionPayment(formData: FormData) {
  const supabase = createClient();
  
  const paymentData = {
    member_id: formData.get('member_id')?.toString() || '',
    amount: parseFloat(formData.get('amount') as string),
    type: 'session',
    session_date: formData.get('session_date') as string,
    created_at: new Date().toISOString(),
  };

  if (!paymentData.member_id || !paymentData.amount) {
    return { error: 'Membre et montant requis' };
  }

  const { error } = await (await supabase)
    .from('payments')
    .insert(paymentData);

  if (error) return { error: error.message };

  revalidatePath('/payments');

  return { success: true };
}
