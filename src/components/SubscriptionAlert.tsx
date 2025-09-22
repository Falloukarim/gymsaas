'use client';

import { useState } from 'react';
import { AlertCircle, X, Smartphone, Phone, Wallet } from 'lucide-react';

interface SubscriptionAlertProps {
  gymId: string;
  gymName: string;
  isTrialExpired: boolean;
}

export default function SubscriptionAlert({
  gymId,
  gymName,
  isTrialExpired,
}: SubscriptionAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-amber-50 to-yellow-100 border-l-6 border-amber-500 text-gray-800 p-6 mb-6 rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-amber-600 w-6 h-6" />
          <h2 className="font-bold text-xl">
            {isTrialExpired ? '⏰ Période d’essai expirée' : '💳 Abonnement expiré'}
          </h2>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-amber-600 hover:text-amber-800 transition-colors"
          aria-label="Fermer l’alerte"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message */}
      <p className="mt-3 text-gray-700 leading-relaxed">
        Votre accès à <span className="font-semibold">{gymName}</span> est toujours disponible,
        mais pour continuer à profiter pleinement de la plateforme, veuillez régulariser votre abonnement.
      </p>

      {/* Bloc infos paiement */}
      <div className="mt-5 p-4 bg-white border border-amber-200 rounded-xl shadow-inner">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-amber-600" />
          Informations de paiement
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-600" />
            <span>
              <strong>Mobile Money(wave, om ):</strong>{' '}
              <span className="font-mono bg-amber-100 px-2 py-1 rounded">
                +221 77 291 77 97
              </span>
            </span>
          </li>
          <li>
            <strong>Montant:</strong> 25 000 XOF
          </li>
          <li>
            <strong>Référence:</strong>{' '}
            <span className="font-mono">
              {gymName} - {gymId.slice(0, 8)}
            </span>
          </li>
          <li className="flex items-center gap-2 text-amber-700">
            <Phone className="w-4 h-4" />
            Après paiement, contactez-nous au{' '}
            <strong>+221 78 731 16 16</strong> pour mise à jour
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setIsVisible(false)}
          className="bg-amber-600 hover:bg-amber-700 transition-colors text-white font-semibold px-5 py-2 rounded-lg shadow"
        >
          J’ai compris
        </button>
      </div>
    </div>
  );
}
