'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { USER_ROLES } from '@/lib/constants/role';

export async function createGym(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user || user.role !== USER_ROLES.OWNER) {
    return { error: 'Unauthorized: Seuls les propriétaires peuvent créer des salles' };
  }

  const rawData = {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    phone: formData.get('phone') as string,
    owner_id: user.id,
  };

  const { data: gym, error } = await (await supabase)
    .from('gyms')
    .insert(rawData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/gyms');
  redirect(`/gyms/${gym.id}`);
}