'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { USER_ROLES } from '@/lib/constants/role';

export async function updateGym(
  gymId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user || user.role !== USER_ROLES.OWNER) {
    return { error: 'Unauthorized' };
  }

  const rawData = {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    phone: formData.get('phone') as string,
  };

  const { error } = await (await supabase)
    .from('gyms')
    .update(rawData)
    .eq('id', gymId)
    .eq('owner_id', user.id); // Double vérification de propriété

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/gyms');
  revalidatePath(`/gyms/${gymId}`);
  redirect(`/gyms/${gymId}`);
}