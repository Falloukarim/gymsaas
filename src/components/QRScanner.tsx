'use client';

import { useEffect, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner'; // Changé de QrScanner à Scanner
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

export function QRScanner() {
  const [result, setResult] = useState<{
    status: 'idle' | 'success' | 'error';
    data?: any;
    error?: string;
  }>({ status: 'idle' });

  const handleScan = async (qrCode: string) => {
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode })
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setResult({ 
          status: 'success', 
          data: {
            member: data.member,
            status: data.subscriptionStatus
          }
        });
      } else {
        setResult({ status: 'error', error: data.error });
      }
    } catch (error) {
      setResult({ status: 'error', error: 'Erreur de scan' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Scanner
          onDecode={handleScan}
          onError={(error: Error) => setResult({ status: 'error', error: error.message })}
          constraints={{ facingMode: 'environment' }}
        />
      </div>


      {result.status === 'success' && (
        <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium">{result.data.member.name}</p>
            <p className="text-sm">
              Statut: {result.data.status === 'active' ? 'Actif' : 'Expiré'}
            </p>
          </div>
        </div>
      )}

      {result.status === 'error' && (
        <div className="p-4 bg-red-50 rounded-lg flex items-center gap-3">
          <X className="h-5 w-5 text-red-600" />
          <p>{result.error || 'Erreur inconnue'}</p>
        </div>
      )}

      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => setResult({ status: 'idle' })}
      >
        Réinitialiser
      </Button>
    </div>
  );
}