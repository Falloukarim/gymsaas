'src/components/members/MemberActionButtons.tsx'

'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteMember } from '@/actions/members/delete'; // Import de l'action

interface MemberActionButtonsProps {
  gymId: string;
  memberId: string;
  hasActiveSubscription: boolean;
  hasLastSubscription: boolean;
}

export function MemberActionButtons({ 
  gymId, 
  memberId, 
  hasActiveSubscription, 
  hasLastSubscription 
}: MemberActionButtonsProps) {
  const [isRenewing, setIsRenewing] = useState(false);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string, setLoading: (value: boolean) => void) => {
    setLoading(true);
    router.push(path);
  };

  const handleDeleteMember = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMember(gymId, memberId);
      
      if (result.success) {
        toast.success('Membre supprimé avec succès');
        router.push(`/gyms/${gymId}/members`);
        router.refresh();
      } else {
        console.error('Erreur lors de la suppression:', result.error);
        toast.error(result.error || 'Erreur lors de la suppression du membre');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex flex-col xs:flex-row gap-2">
        {hasActiveSubscription || hasLastSubscription ? (
          <Button
            size="sm"
            className="w-full"
            disabled={isRenewing}
            onClick={() => handleNavigation(`/gyms/${gymId}/members/${memberId}/renew`, setIsRenewing)}
          >
            {isRenewing ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Chargement...
              </>
            ) : (
              'Renouveler'
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full"
            disabled={isRenewing}
            onClick={() => handleNavigation(`/gyms/${gymId}/members/${memberId}/renew`, setIsRenewing)}
          >
            {isRenewing ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Chargement...
              </>
            ) : (
              'Ajouter un abonnement'
            )}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={isAddingSession}
          onClick={() => handleNavigation(`/gyms/${gymId}/members/${memberId}/new-session`, setIsAddingSession)}
        >
          {isAddingSession ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Chargement...
            </>
          ) : (
            'Nouvelle session'
          )}
        </Button>
      </div>

      {/* Bouton de suppression avec confirmation */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive" 
            size="sm"
            className="w-full"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer le membre
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Elle supprimera définitivement le membre
              ainsi que toutes ses données associées (abonnements, paiements, historiques d'accès).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel  disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}