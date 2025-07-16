'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateMember(
  memberId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createClient();

  const rawData = {
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    subscription_id: formData.get('subscription_id') as string || null,
  };

  const { error } = await (await supabase)
    .from('members')
    .update(rawData)
    .eq('id', memberId);

  if (error) return { error: error.message };

  revalidatePath('/members');
  revalidatePath(`/members/${memberId}`);
  redirect(`/members/${memberId}`);
}