'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  category_id: string;
  product_categories: { name: string };
  price: number;
  quantity: number;
  unit: string;
  min_stock_level: number;
  suppliers?: { name: string };
}

interface ProductListProps {
  gymId: string;
}

export default function ProductList({ gymId }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [gymId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/gyms/${gymId}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error('Erreur lors du chargement des produits');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesFilter =
      filter === 'lowStock' ? product.quantity <= product.min_stock_level : true;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="text-center py-8">⏳ Chargement des produits...</div>;
  }

  return (
    <Card className="shadow-lg rounded-2xl border-0 bg-gradient-to-r from-[#00624f] to-[#004a3a] text-white">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/20 pb-4">
        <CardTitle className="text-xl font-bold text-white">📦 Gestion des Produits</CardTitle>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-300" />
            <Input
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white"
          >
            <option value="all" className="bg-[#00624f]">Tous les produits</option>
            <option value="lowStock" className="bg-[#00624f]">Stock faible</option>
          </select>
          <Link href={`/gyms/${gymId}/stock/products/new`}>
            <Button className="flex items-center gap-2 shadow bg-white text-[#00624f] hover:bg-gray-100">
              <Plus className="w-4 h-4" />
              Nouveau produit
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="bg-white/5">
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-300 py-10">
            Aucun produit trouvé.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-5 border border-white/20 rounded-xl bg-gradient-to-br from-[#00624f]/90 to-[#004a3a]/90 text-white shadow-sm hover:shadow-md transition-all hover:from-[#00624f] hover:to-[#004a3a]"
              >
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                    {product.name}
                    {product.quantity <= product.min_stock_level && (
                      <Badge variant="destructive" className="text-xs flex items-center gap-1 bg-amber-500">
                        <AlertTriangle className="w-3 h-3" />
                        Stock faible
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-gray-200 mb-1">
                    {product.product_categories.name} • {product.quantity} {product.unit}
                  </p>
                  <p className="text-sm text-gray-300 mb-3">
                    {product.suppliers?.name ? `Fournisseur : ${product.suppliers.name}` : ''}
                  </p>
                  <p className="text-base font-medium text-white bg-white/10 p-2 rounded-lg text-center">
                    {product.price.toLocaleString()} XOF
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link href={`/gyms/${gymId}/stock/products/${product.id}`}>
                    <Button variant="outline" className="shadow-sm bg-white/10 text-white border-white/20 hover:bg-white hover:text-[#00624f]">
                      Détails
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}