'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return redirect('/login?message=Session expirée');
  }

  // Gestion de l'avatar
  let avatarUrl: string | null = null;
  const avatarFile = formData.get('avatar_url') as File;

  if (avatarFile?.size > 0) {
    try {
      const ext = avatarFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      
      // Supprimer l'ancien avatar si il existe
      const { data: oldAvatar } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (oldAvatar?.avatar_url) {
        const oldFilePath = oldAvatar.avatar_url.split('/public/avatars/')[1];
        await supabase.storage
          .from('avatars')
          .remove([oldFilePath]);
      }

      // Upload du nouveau fichier
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Récupération de l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      avatarUrl = publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return { error: "Erreur lors de l'upload de l'image" };
    }
  }

  // Mise à jour du profil
  try {
    const updateData = {
      full_name: formData.get('full_name'),
      phone: formData.get('phone'),
      updated_at: new Date().toISOString(),
      ...(avatarUrl && { avatar_url: avatarUrl })
    };

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id);

    if (error) throw error;

    revalidatePath('/profile');
    return { success: "Profil mis à jour avec succès" };
  } catch (error) {
    console.error('DB error:', error);
    return { error: "Erreur lors de la mise à jour du profil" };
  }
}