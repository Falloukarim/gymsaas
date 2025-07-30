'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function SubscriptionCard({ plan, gymId }: { plan: any, gymId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // components/SubscriptionCard.tsx
// components/SubscriptionCard.tsx
const handleSubscribe = async () => {
  setIsLoading(true);
  try {
    console.log('Sending request with:', { 
      subscription_id: plan.id, 
      gym_id: gymId 
    });

    // Dans SubscriptionCard
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/checkout`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription_id: plan.id,
      gym_id: gymId
    }),
  }
);

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(
        errorText.includes('{') 
          ? JSON.parse(errorText).error 
          : `Erreur ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    console.log('Response data:', data);

    if (!data?.checkout_url) {
      throw new Error('URL de paiement manquante');
    }

    window.location.href = data.checkout_url;
  } catch (error) {
    console.error('Full subscription error:', error);
    toast.error(
      error instanceof Error 
        ? error.message 
        : 'Erreur lors de la souscription'
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
      <h3 className="text-xl font-bold">{plan.name}</h3>
      <p className="text-gray-600 mt-2">{plan.description}</p>
      <div className="mt-4">
        <span className="text-2xl font-semibold">
          {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
          }).format(plan.price)}
        </span>
        {plan.billing_cycle === 'annually' && (
          <span className="ml-2 text-sm text-green-600">(Économisez 20%)</span>
        )}
      </div>
      <Button 
        onClick={handleSubscribe}
        className="mt-6 w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Redirection...' : 'Souscrire maintenant'}
      </Button>
    </div>
  );
}