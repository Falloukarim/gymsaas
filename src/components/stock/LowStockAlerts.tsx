'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  stock_in_pieces: number;
}

interface LowStockAlertsProps {
  gymId: string;
}

export default function LowStockAlerts({ gymId }: LowStockAlertsProps) {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    checkLowStock();
    const interval = setInterval(checkLowStock, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [gymId]);

  const checkLowStock = async () => {
    try {
      const response = await fetch(`/api/gyms/${gymId}/products`);
      if (response.ok) {
        const products: Product[] = await response.json();
        
        const lowStock = products.filter(product => 
          product.stock_in_pieces <= 10 && product.stock_in_pieces > 0
        );
        
        setLowStockProducts(lowStock);

        if (lowStock.length > 0 && !hasNotified) {
          toast.error(
            `${lowStock.length} produit(s) en stock faible (<= 10 pièces). Pensez à réapprovisionner!`,
            { duration: 6000 }
          );
          setHasNotified(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du stock:', error);
    }
  };

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <h3 className="font-semibold text-yellow-800">Alertes de Stock</h3>
      </div>
      <p className="text-yellow-700 text-sm mb-2">
        {lowStockProducts.length} produit(s) ont un stock faible (≤ 10 pièces) :
      </p>
      <ul className="text-yellow-700 text-sm list-disc list-inside">
        {lowStockProducts.map(product => (
          <li key={product.id}>
            {product.name} ({product.stock_in_pieces} pièces restantes)
          </li>
        ))}
      </ul>
    </div>
  );
}