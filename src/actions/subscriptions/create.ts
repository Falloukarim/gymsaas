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
    type: formData.get('type') as string,
    price: parseFloat(formData.get('price') as string),
    duration_days: parseInt(formData.get('duration_days') as string),
    description: formData.get('description') as string || null,
    is_session: formData.get('is_session') === 'true',
    session_price: formData.get('is_session') === 'true' 
      ? parseFloat(formData.get('price') as string) 
      : null
  };

  const { error } = await (await supabase)
    .from('subscriptions')
    .insert(rawData);

  if (error) return { error: error.message };

  revalidatePath(`/gyms/${rawData.gym_id}/subscriptions`);
  redirect(`/gyms/${rawData.gym_id}/subscriptions`);
}

export async function createSessionSubscription(
  prevState: any,
  formData: FormData
) {
  const supabase = createClient();
  const gymId = formData.get('gym_id') as string;
  const price = parseFloat(formData.get('price') as string);
  const description = formData.get('description') as string;

  const { data, error } = await (await supabase)
    .from('subscriptions')
    .insert({
      gym_id: gymId,
      type: 'session', // Assurez-vous que cette valeur est valide selon votre contrainte
      price,
      duration_days: 1,
      description: description || null,
      is_session: true,
      session_price: price
    })
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    return { error: error.message };
  }

  revalidatePath(`/gyms/${gymId}/subscriptions`);
  return { success: true, data };
}