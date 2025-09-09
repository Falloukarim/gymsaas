'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteMember(gymId: string, memberId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    console.log('Suppression membre:', memberId, 'de la salle:', gymId);

    // Vérifier que le membre existe et appartient à la salle
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, gym_id')
      .eq('id', memberId)
      .eq('gym_id', gymId)
      .maybeSingle();

    if (!member) {
      console.log('Membre introuvable ou ne correspond pas à la salle:', memberError);
      return { error: 'Membre non trouvé' };
    }

    // Supprimer les données associées (dans l'ordre pour respecter les contraintes de clés étrangères)
    const tables = ['access_logs', 'payments', 'member_subscriptions', 'tickets'];
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('member_id', memberId);
      
      if (error) {
        console.warn(`Avertissement suppression ${table}:`, error.message);
        // On continue malgré les avertissements
      }
    }

    // Supprimer le membre
    const { error: deleteError } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      console.error('Erreur suppression membre:', deleteError);
      return { error: 'Erreur lors de la suppression du membre' };
    }

    revalidatePath(`/gyms/${gymId}/members`);
    return { success: true };

  } catch (error) {
    console.error('Erreur:', error);
    return { error: 'Erreur interne du serveur' };
  }
}