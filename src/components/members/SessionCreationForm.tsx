'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createSessionPayment } from '@/actions/createSessionPayment';

interface Member {
  id: string;
  full_name: string;
  qr_code?: string;
  avatar_url?: string;
}

interface Session {
  id: string;
  price: number;
  description?: string;
  is_session?: boolean;
}

export default function SessionCreationForm({
  member,
  gymId,
  sessions,
}: {
  member: Member;
  gymId: string;
  sessions: Session[];
}) {
  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState<string>(sessions[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateSession = async () => {
    if (!selectedSession) {
      toast.error('Veuillez sélectionner une session');
      return;
    }

    setIsProcessing(true);
    try {
      const session = sessions.find(s => s.id === selectedSession);
      if (!session) throw new Error('Session non trouvée');

      const result = await createSessionPayment({
        member_id: member.id,
        amount: session.price,
        subscription_id: selectedSession,
        gym_id: gymId
      });

      if (result.error) throw new Error(result.error);

      toast.success('Session créée avec succès', {
        description: `${member.full_name} a maintenant accès pour aujourd'hui`
      });

      router.refresh();
      setTimeout(() => {
        router.push(`/gyms/${gymId}/members/${member.id}`);
      }, 1500);
    } catch (error) {
      console.error('Session creation error:', error);
      toast.error('Erreur lors de la création de la session');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-700 pb-4">
        <h3 className="text-lg font-medium">Session ponctuelle</h3>
        <p className="text-sm text-gray-400">
          Accès valable pour une seule journée - Pas de badge généré
        </p>
      </div>

      <RadioGroup 
        value={selectedSession} 
        onValueChange={setSelectedSession}
        className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {sessions.map((session) => (
          <div key={session.id}>
            <RadioGroupItem 
              value={session.id} 
              id={session.id} 
              className="peer sr-only" 
            />
            <Label
              htmlFor={session.id}
              className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-800 p-3 sm:p-4 hover:bg-gray-700 hover:text-white peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer transition-colors"
            >
              <div className="w-full">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-bold text-base sm:text-lg">Session</p>
                    <p className="text-xs sm:text-sm text-gray-400">Accès: 1 jour</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold whitespace-nowrap">
                    {session.price.toLocaleString('fr-FR')} F CFA
                  </p>
                </div>
                {session.description && (
                  <p className="mt-2 text-xs sm:text-sm text-gray-300">
                    {session.description}
                  </p>
                )}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/gyms/${gymId}/members/${member.id}/renew`)}
          className="w-full text-black sm:w-auto"
        >
          Créer un abonnement
        </Button>
        <Button 
          onClick={handleCreateSession} 
          disabled={isProcessing || !selectedSession}
          className="w-full sm:w-auto bg-green-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            'Confirmer la session'
          )}
        </Button>
      </div>
    </div>
  );
}