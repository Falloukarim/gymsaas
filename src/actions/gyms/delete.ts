'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteGym(gymId: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  // Vérifier qu'aucun membre n'est associé
  const { count: membersCount } = await (await supabase)
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('gym_id', gymId);

  if (membersCount && membersCount > 0) {
    return { error: 'Impossible de supprimer : membres existants' };
  }

  const { error } = await (await supabase)
    .from('gyms')
    .delete()
    .eq('id', gymId)
    .eq('owner_id', user?.id); // Seul le propriétaire peut supprimer

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/gyms');
  redirect('/gyms');
}