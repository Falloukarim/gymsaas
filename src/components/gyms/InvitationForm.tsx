// components/gyms/InvitationForm.tsx
'use client';

import { createClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Invitation {
  id: string;
  gym_id: string;
  role: string;
  accepted: boolean;
  gyms: {
    name: string;
  };
}

interface InvitationFormProps {
  invitation: Invitation;
  userId: string;
}

export function InvitationForm({ invitation, userId }: InvitationFormProps) {
  const supabase = createClient();

  const acceptInvitation = async () => {
    try {
      // Ajouter l'utilisateur au gym
      const { error } = await supabase
        .from('gbus')
        .insert({
          gym_id: invitation.gym_id,
          user_id: userId,
          role: invitation.role
        });

      if (error) throw error;

      // Marquer l'invitation comme acceptée
      await supabase
        .from('invitations')
        .update({ accepted: true })
        .eq('id', invitation.id);

      toast.success(`Vous avez rejoint le gym ${invitation.gyms.name} en tant que ${invitation.role}`);
      window.location.href = `/gyms/${invitation.gym_id}/dashboard`;
    } catch (error: unknown) {
      console.error(error);
      toast.error(error instanceof Error 
        ? error.message 
        : "Erreur lors de l&apos;acceptation de l&apos;invitation");
    }
  };

  return (
    <div className="p-4 border rounded flex justify-between items-center">
      <div>
        <h3 className="font-medium">{invitation.gyms.name}</h3>
        <p className="text-sm text-gray-600">Rôle: {invitation.role}</p>
      </div>
      <Button onClick={acceptInvitation}>
        Accepter l&apos;invitation
      </Button>
    </div>
  );
}