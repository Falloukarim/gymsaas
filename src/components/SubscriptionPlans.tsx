'use client'; 

import { useState } from 'react';
import axios from 'axios';

export default function SubscriptionPlans({ gymId, plans }: { gymId: string, plans: any[] }) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (planId: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/subscriptions/checkout', {
        subscription_id: planId,
      });

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Une erreur est survenue lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div 
          key={plan.id} 
          className={`border rounded-lg p-6 ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedPlan(plan.id)}
        >
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <p className="text-gray-600 mt-2">{plan.description}</p>
          <div className="mt-4">
            <span className="text-3xl font-bold">{plan.price} XOF</span>
            <span className="text-gray-500"> / {getIntervalText(plan.billing_cycle)}</span>
          </div>
          <button
            onClick={() => handleCheckout(plan.id)}
            disabled={loading}
            className="mt-6 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Souscrire'}
          </button>
        </div>
      ))}
    </div>
  );
}

function getIntervalText(interval: string) {
  switch (interval) {
    case 'monthly': return 'mois';
    case 'quarterly': return 'trimestre';
    case 'semiannually': return 'semestre';
    case 'annually': return 'an';
    default: return interval;
  }
}