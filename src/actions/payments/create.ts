'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPayment(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createClient();

  const rawData = {
    member_id: formData.get('member_id') as string,
    amount: parseFloat(formData.get('amount') as string),
    type: formData.get('type') as 'subscription' | 'session',
    session_date: formData.get('session_date') as string || null,
    subscription_id: formData.get('subscription_id') as string || null,
  };

  const { error } = await supabase
    .from('payments')
    .insert(rawData);

  if (error) return { error: error.message };

  revalidatePath('/payments');
  revalidatePath(`/members/${rawData.member_id}`);
  redirect('/payments');
}