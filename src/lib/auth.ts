'use server';

import { createClient } from '@/utils/supabase/server';

export async function getGymIdForCurrentUser(): Promise<string | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  if (!user) return null;

  // Exemple : on suppose que l’utilisateur est lié à un gym via la table `gbus`
  const { data, error } = await (await supabase)
    .from('gbus')
    .select('gym_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return data.gym_id;
}
