'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createSubscription(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createClient();

  const rawData = {
    gym_id: formData.get('gym_id') as string,
    name: formData.get('name') as string,
    price: parseFloat(formData.get('price') as string),
    duration_days: parseInt(formData.get('duration_days') as string),
    description: formData.get('description') as string || null,
  };

  const { error } = await supabase
    .from('subscriptions')
    .insert(rawData);

  if (error) return { error: error.message };

  revalidatePath('/subscriptions');
  redirect('/subscriptions');
}