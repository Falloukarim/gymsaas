'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

interface StockMovement {
  id: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  created_at: string;
  products: { name: string };
  users: { full_name: string };
}

export default function StockMovementsPage({ params }: { params: { id: string } }) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovements();
  }, [params.id]);

  const fetchMovements = async () => {
    try {
      const response = await fetch(`/api/gyms/${params.id}/stock-movements?limit=100`);
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
      } else {
        toast.error('Erreur lors du chargement des mouvements');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des mouvements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête avec une jolie card dégradée */}
      <Card className="rounded-2xl shadow-xl bg-gradient-to-r from-blue-100 via-blue-100 to-green-800 text-black">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide drop-shadow-lg">
            📦 Mouvements de Stock
          </h1>
          <p className="mt-2 text-black text-sm md:text-base">
            Suivez l'historique des entrées et sorties de votre stock
          </p>
        </CardContent>
      </Card>

      {/* Carte principale */}
      <Card className="rounded-2xl bg-green shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Historique des mouvements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {movements.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                Aucun mouvement de stock enregistré
              </p>
            ) : (
              movements.map((movement) => (
                <div 
                  key={movement.id} 
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{movement.products.name}</h3>
                    <p className="text-sm text-gray-300">
                      {movement.type === 'in' ? 'Entrée' : 'Sortie'} de {movement.quantity} unités
                    </p>
                    <p className="text-sm text-gray-300 mt-1">Raison: {movement.reason}</p>
                    <p className="text-xs text-gray-300 mt-2">
                      Par {movement.users.full_name} • {new Date(movement.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    movement.type === 'in' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}