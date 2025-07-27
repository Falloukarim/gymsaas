'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await (await supabase).auth.getUser();
    if (authError || !user) throw new Error('Session expirée');

    // Gestion de l'avatar
    let avatarUrl: string | null = null;
    const avatarFile = formData.get('avatar_url') as File;

    if (avatarFile?.size > 0) {
      const ext = avatarFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      
      // Supprimer l'ancien avatar s'il existe
      const { data: oldAvatar } = await (await supabase)
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (oldAvatar?.avatar_url) {
        const oldFilePath = oldAvatar.avatar_url.split('/public/avatars/')[1];
        await (await supabase).storage.from('avatars').remove([oldFilePath]);
      }

      // Upload du nouveau fichier
      const { error: uploadError } = await (await supabase).storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw new Error("Erreur lors de l'upload de l'image");

      // Récupération de l'URL publique
      const { data: { publicUrl } } = (await supabase).storage
        .from('avatars')
        .getPublicUrl(fileName);

      avatarUrl = publicUrl;
    }

    // Mise à jour du profil
    const updateData = {
      full_name: formData.get('full_name'),
      phone: formData.get('phone'),
      updated_at: new Date().toISOString(),
      ...(avatarUrl && { avatar_url: avatarUrl }),
    };

    const { error } = await (await supabase)
      .from('users')
      .update(updateData)
      .eq('id', user.id);

    if (error) throw new Error("Erreur lors de la mise à jour du profil");

    revalidatePath('/profile');
    return { success: 'Profil mis à jour avec succès' };
  } catch (error: any) {
    console.error('Error:', error);
    return { error: error.message };
  }
}