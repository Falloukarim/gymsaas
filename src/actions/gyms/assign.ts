'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { USER_ROLES } from '@/lib/constants/role';

export async function assignGymManager(
  gymId: string,
  userId: string,
  role: 'admin' | 'staff'
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user: currentUser } } = await (await supabase).auth.getUser();

  // Seul le propriétaire peut assigner des rôles
  if (currentUser?.role !== USER_ROLES.OWNER) {
    return { error: 'Unauthorized' };
  }

  // Vérifier que la salle appartient bien au propriétaire
  const { data: gym } = await (await supabase)
    .from('gyms')
    .select('owner_id')
    .eq('id', gymId)
    .single();

  if (gym?.owner_id !== currentUser.id) {
    return { error: 'Gym ownership mismatch' };
  }

  // Mettre à jour le rôle de l'utilisateur
  const { error } = await (await supabase)
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  // Ajouter la relation dans une table gym_users (à créer)
  const { error: relationError } = await (await supabase)
    .from('gym_users')
    .upsert({
      gym_id: gymId,
      user_id: userId,
      assigned_by: currentUser.id
    });

  if (relationError) {
    return { error: relationError.message };
  }

  revalidatePath(`/gyms/${gymId}/team`);
  return { error: undefined };
}