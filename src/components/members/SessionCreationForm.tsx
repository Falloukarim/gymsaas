'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SessionCreationForm({
  member,
  gymId,
  sessions,
}: {
  member: any;
  gymId: string;
  sessions: any[];
}) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState<string>(sessions[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateSession = async () => {
    if (!selectedSession) return;

    setIsProcessing(true);
    try {
      // Get the selected session details
      const session = sessions.find(s => s.id === selectedSession);
      if (!session) throw new Error('Session non trouvée');

      // Calculate dates (session is valid for 1 day)
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      // Create member subscription record for the session
      const { error: subscriptionError } = await supabase
        .from('member_subscriptions')
        .insert({
          member_id: member.id,
          subscription_id: selectedSession,
          gym_id: gymId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
        });

      if (subscriptionError) throw subscriptionError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          member_id: member.id,
          gym_id: gymId,
          amount: session.price,
          type: 'session',
          subscription_id: selectedSession,
          status: 'paid',
          payment_method: 'cash', // Modifiable selon vos besoins
        });

      if (paymentError) throw paymentError;

      toast.success('Session créée avec succès');
      router.push(`/gyms/${gymId}/members/${member.id}`);
    } catch (error) {
      console.error('Session creation error:', error);
      toast.error('Erreur lors de la création de la session');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <RadioGroup 
        value={selectedSession} 
        onValueChange={setSelectedSession}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
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
              className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-800 p-4 hover:bg-gray-700 hover:text-white peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
            >
              <div className="w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">Session</p>
                    <p className="text-sm text-gray-400">
                      Accès: 1 jour
                    </p>
                  </div>
                  <p className="text-2xl font-bold">{session.price} F CFA</p>
                </div>
                {session.description && (
                  <p className="mt-2 text-sm text-gray-300">{session.description}</p>
                )}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="flex justify-end pt-4">
        <Button onClick={handleCreateSession} disabled={isProcessing || !selectedSession}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            'Confirmer la session'
          )}
        </Button>
      </div>
    </div>
  );
}