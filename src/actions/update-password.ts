// actions/update-password.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function updatePassword(formData: FormData) {
  const supabase = createClient();
  
  // 1. Vérifiez l'utilisateur de manière sécurisée
  const { data: { user }, error: authError } = await (await supabase).auth.getUser();
  
  if (authError || !user) {
    return { error: "Session expirée, veuillez vous reconnecter" };
  }

  // 2. Récupérez les données du formulaire
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // 3. Validation des données
  if (newPassword !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas" };
  }

  if (newPassword.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères" };
  }

  // 4. Mise à jour sécurisée du mot de passe
  try {
    // D'abord, réauthentifiez l'utilisateur
    const { error: reauthError } = await (await supabase).auth.signInWithPassword({
      email: user.email || '',
      password: currentPassword,
    });

    if (reauthError) {
      return { error: "Mot de passe actuel incorrect" };
    }

    // Ensuite, mettez à jour le mot de passe
    const { error: updateError } = await (await supabase).auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { error: "Échec de la mise à jour: " + updateError.message };
    }

    return { success: "Mot de passe mis à jour avec succès" };
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return { error: "Une erreur inattendue est survenue" };
  }
}