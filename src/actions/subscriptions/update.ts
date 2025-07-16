'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateSubscription(
  subscriptionId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createClient();

  const rawData = {
    name: formData.get('name') as string,
    price: parseFloat(formData.get('price') as string),
    duration_days: parseInt(formData.get('duration_days') as string),
    description: formData.get('description') as string || null,
  };

  const { error } = await (await supabase)
    .from('subscriptions')
    .update(rawData)
    .eq('id', subscriptionId);

  if (error) return { error: error.message };

  revalidatePath('/subscriptions');
  revalidatePath(`/subscriptions/${subscriptionId}`);
  redirect(`/subscriptions/${subscriptionId}`);
}