'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await (await supabase).auth.getUser();
  
  if (authError || !user) {
    return { error: "Session expirée, veuillez vous reconnecter" };
  }

  // Upload de l'image si elle existe
  const avatarFile = formData.get('avatar') as File | null;
  let avatarUrl = null;

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${ext}`;
    const { data, error } = await (await supabase).storage
      .from('avatars')
      .upload(fileName, avatarFile);

    if (error) {
      return { error: "Erreur lors de l'upload de l'image" };
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = (await supabase).storage
      .from('avatars')
      .getPublicUrl(fileName);

    avatarUrl = publicUrl;
  }

  // Mise à jour du profil
  const { error } = await (await supabase)
    .from('users')
    .update({ 
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      ...(avatarUrl && { avatar_url: avatarUrl }),
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (error) {
    return { error: "Erreur lors de la mise à jour" };
  }

  revalidatePath('/profile');
  return { success: "Profil mis à jour" };
}