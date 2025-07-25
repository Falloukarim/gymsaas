'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Member {
  id: string;
  has_subscription?: boolean;
}

interface Subscription {
  is_session: any;
  id: string;
  type: string;
  duration_days: number;
  price: number;
  description?: string;
}

interface MemberSubscription {
  subscription_id: string;
  status: string;
}

interface SubscriptionRenewalFormProps {
  member: Member;
  gymId: string;
  subscriptions: Subscription[];
  currentSubscription?: MemberSubscription;
}

export default function SubscriptionRenewalForm({
  member,
  gymId,
  subscriptions,
  currentSubscription,
}: SubscriptionRenewalFormProps) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [selectedSubscription, setSelectedSubscription] = useState<string>(
    currentSubscription?.subscription_id || subscriptions[0]?.id || ''
  );
  const [isProcessing, setIsProcessing] = useState(false);
   
  // Ajoutez cette fonction dans SubscriptionRenewalForm.tsx
const generateQrCode = async (memberId: string) => {
  try {
    const { error } = await supabase
      .from('members')
      .update({
        qr_code: `GYM-${memberId}-${Date.now()}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return false;
  }
};

// Modifiez la fonction handleRenew :
// Dans SubscriptionRenewalForm.tsx
const handleRenew = async () => {
  if (!selectedSubscription || !gymId) {
    toast.error('Paramètres manquants');
    return;
  }

  setIsProcessing(true);
  const toastId = toast.loading('Traitement du renouvellement...');

  try {
    // Vérifier que ce n'est pas une session
    const selectedSub = subscriptions.find(s => s.id === selectedSubscription);
    if (selectedSub?.is_session) {
      throw new Error('Impossible de renouveler une session');
    }

    const response = await fetch('/api/renew-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: member.id,
        gymId,
        subscriptionId: selectedSubscription
      }),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Erreur lors du renouvellement');
    }

    toast.success('Abonnement renouvelé avec succès', {
      id: toastId,
      description: `Nouvelle date de fin: ${new Date(
        new Date().setDate(new Date().getDate() + 
        (selectedSub?.duration_days || 30))
      ).toLocaleDateString('fr-FR')}`
    });

    router.push(`/gyms/${gymId}/members/${member.id}`);
    router.refresh();

  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Erreur inconnue', {
      id: toastId
    });
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="space-y-6">
      <RadioGroup 
        value={selectedSubscription} 
        onValueChange={setSelectedSubscription}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {subscriptions.map((subscription) => (
          <div key={subscription.id}>
            <RadioGroupItem 
              value={subscription.id} 
              id={subscription.id} 
              className="peer sr-only" 
            />
            <Label
              htmlFor={subscription.id}
              className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-800 p-4 hover:bg-gray-700 hover:text-white peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
            >
              <div className="w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg capitalize">{subscription.type}</p>
                    <p className="text-sm text-gray-400">
                      {subscription.duration_days} jours
                    </p>
                  </div>
                  <p className="text-2xl font-bold">{subscription.price} F CFA</p>
                </div>
                {subscription.description && (
                  <p className="mt-2 text-sm text-gray-300">{subscription.description}</p>
                )}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="flex justify-end pt-4">
        <Button onClick={handleRenew} disabled={isProcessing || !selectedSubscription}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            'Confirmer le renouvellement'
          )}
        </Button>
      </div>
    </div>
  );
}