'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SubscriptionRenewalForm({
  member,
  gymId,
  subscriptions,
  currentSubscription,
}: {
  member: any;
  gymId: string;
  subscriptions: any[];
  currentSubscription?: any;
}) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [selectedSubscription, setSelectedSubscription] = useState<string>(
    currentSubscription?.subscription_id || subscriptions[0]?.id || ''
  );
  const [isProcessing, setIsProcessing] = useState(false);

const handleRenew = async () => {
  if (!selectedSubscription || !gymId) {
    toast.error('Paramètres manquants');
    return;
  }

  setIsProcessing(true);
  try {
    // Get the selected subscription details
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', selectedSubscription)
      .single();

    if (subError || !subscription) throw subError || new Error('Abonnement non trouvé');

    // Calculate dates based on subscription duration
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + subscription.duration_days);

    // Désactiver les anciens abonnements
    const { error: updateError } = await supabase
      .from('member_subscriptions')
      .update({ status: 'expired' })
      .eq('member_id', member.id)
      .eq('status', 'active');

    if (updateError) throw updateError;

    // Create new member subscription
    const { error: subscriptionError } = await supabase
      .from('member_subscriptions')
      .insert({
        member_id: member.id,
        subscription_id: selectedSubscription,
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
        amount: subscription.price,
        type: 'subscription',
        subscription_id: selectedSubscription,
        status: 'paid',
        payment_method: 'cash',
      });

    if (paymentError) throw paymentError;

    // Update member's subscription status
    const { error: memberError } = await supabase
      .from('members')
      .update({ has_subscription: true })
      .eq('id', member.id);

    if (memberError) throw memberError;

    toast.success('Abonnement renouvelé avec succès');
    router.refresh();
    router.push(`/gyms/${gymId}/members/${member.id}`);
  } catch (error) {
    console.error('Renewal error:', error);
    toast.error(`Erreur lors du renouvellement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  } finally {
    setIsProcessing(false);
  }
};
    console.log('Selected subscription:', selectedSubscription);
console.log('Gym ID:', gymId);
console.log('Member ID:', member.id);
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