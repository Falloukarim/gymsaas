'use client';

import ProductList from '@/components/stock/ProductList';
import LowStockAlerts from '@/components/stock/LowStockAlerts';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from 'react-hot-toast';

export default function ProductsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#00c9a7',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ff4d4f',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Alerte de stock faible */}
      <LowStockAlerts gymId={params.id} />
      
      <Card className="rounded-2xl shadow-xl bg-gradient-to-r from-blue-100 via-blue-100 to-green-800 text-black">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide drop-shadow-lg">
            📦 Gestion des Produits
          </h1>
          <p className="mt-2 text-black text-sm md:text-base">
            Gérez votre inventaire et suivez vos stocks en temps réel
          </p>
        </CardContent>
      </Card>

      <ProductList gymId={params.id} />
    </div>
  );
}