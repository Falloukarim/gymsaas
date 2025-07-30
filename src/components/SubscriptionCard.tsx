'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function SubscriptionCard({ 
  plan, 
  gymId,
  isPopular = false 
}: { 
  plan: any, 
  gymId: string,
  isPopular?: boolean 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_id: plan.id, gym_id: gymId }),
      });

      if (!response.ok) throw new Error(await response.text());
      const { checkout_url } = await response.json();
      window.location.href = checkout_url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de paiement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative border rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 bg-white 
      ${isPopular ? 'ring-2 ring-blue-500 transform md:-translate-y-2' : ''}`}>
      
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          POPULAIRE
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
        {isPopular && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            Recommandé
          </span>
        )}
      </div>

      <p className="text-gray-600 mb-6">{plan.description}</p>

      <div className="mb-6">
        <span className="text-4xl font-extrabold text-gray-900">
          {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
          }).format(plan.price)}
        </span>
        <span className="text-gray-500 ml-1"></span>
      </div>

        <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                <span className="text-purple-600 font-medium">Accès illimité</span>
              </li>
           <li className="flex items-center">
               <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               <span className="text-purple-600 font-medium">Support prioritaire</span>
           </li>
 B            <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
              <span className="text-purple-600 font-medium">Analyses avancées</span>
            </li>
        </ul>

      <Button 
        onClick={handleSubscribe}
        className={`w-full py-6 text-white font-semibold ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Traitement...
          </span>
        ) : (
          'Souscrire maintenant'
        )}
      </Button>

      {plan.billing_cycle === 'annually' && (
        <p className="text-center text-sm text-green-600 mt-3">
          Économisez 20% par rapport au mensuel
        </p>
      )}
    </div>
  );
}