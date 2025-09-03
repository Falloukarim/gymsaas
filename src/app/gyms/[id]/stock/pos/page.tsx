'use client';

import PointOfSale from '@/components/stock/PointOfSale';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from 'react-hot-toast';

export default function PointOfSalePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-green from-slate-100 via-blue-50 to-slate-100 py-8 px-4">
      {/* Composant Toaster pour les notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            borderRadius: '12px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* En-tête moderne */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              🛒 Point de Vente Intelligent
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
              Système de vente moderne avec suivi en temps réel des bénéfices et gestion avancée du stock
            </p>
          </div>
        </div>
      </div>

      {/* Composant principal */}
      <div className="max-w-7xl mx-auto">
        <PointOfSale gymId={params.id} />
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-12 text-center">
        <p className="text-gray-500 text-sm">
          💰 Système de gestion de vente • Optimisé pour les performances
        </p>
      </footer>
    </div>
  );
}