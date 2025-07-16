'use server';

import { createClient } from '@/utils/supabase/server';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: "Session expirée, veuillez vous reconnecter" };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (error) {
    return { error: "Erreur lors de la mise à jour" };
  }

  return { success: "Profil mis à jour" };
}