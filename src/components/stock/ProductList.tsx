'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle, Search, Trash2, CheckSquare, Square } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Product {
  id: string;
  name: string;
  category_id: string;
  product_categories: { name: string };
  price: number;
  quantity: number;
  stock_in_pieces: number;
  unit: string;
  supplier_id: string;
  suppliers?: { name: string };
  min_stock_level: number;
  package_type: string;
  items_per_package: number;
  unit_price: number | null;
}

interface ProductListProps {
  gymId: string;
}

export default function ProductList({ gymId }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

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

  const getStockInPieces = (product: Product): number => {
    return product.stock_in_pieces || 0;
  };

  const getMinStockInPieces = (): number => {
    return 10;
  };

  const filteredProducts = products.filter((product) => {
    const stockInPieces = getStockInPieces(product);
    const minStockInPieces = getMinStockInPieces();
    
    const matchesFilter =
      filter === 'lowStock' ? stockInPieces <= minStockInPieces : true;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id));
    }
    setSelectAll(!selectAll);
  };

  const deleteSelectedProducts = async () => {
    try {
      const responses = await Promise.all(
        selectedProducts.map(productId =>
          fetch(`/api/gyms/${gymId}/products/${productId}`, {
            method: 'DELETE',
          })
        )
      );

      const allSuccess = responses.every(response => response.ok);
      
      if (allSuccess) {
        toast.success(`${selectedProducts.length} produit(s) supprimé(s) avec succès`);
        setSelectedProducts([]);
        setSelectAll(false);
        fetchProducts();
      } else {
        toast.error('Erreur lors de la suppression de certains produits');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const deleteAllProducts = async () => {
    try {
      const responses = await Promise.all(
        products.map(product =>
          fetch(`/api/gyms/${gymId}/products/${product.id}`, {
            method: 'DELETE',
          })
        )
      );

      const allSuccess = responses.every(response => response.ok);
      
      if (allSuccess) {
        toast.success('Tous les produits ont été supprimés avec succès');
        setSelectedProducts([]);
        setSelectAll(false);
        fetchProducts();
      } else {
        toast.error('Erreur lors de la suppression de tous les produits');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

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
            <option value="lowStock" className="bg-[#00624f]">Stock faible (&lt;= 10 pièces)</option>
          </select>
          <Link href={`/gyms/${gymId}/stock/products/new`}>
            <Button className="flex items-center gap-2 shadow bg-white text-[#00624f] hover:bg-gray-100">
              <Plus className="w-4 h-4" />
              Nouveau produit
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="bg-white/5 p-6">
        {/* En-tête de sélection */}
        {(selectedProducts.length > 0 || products.length > 0) && (
          <div className="flex items-center justify-between mb-6 p-4 bg-white/10 rounded-lg">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="border-white/20 text-black hover:bg-white/20"
              >
                {selectAll ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                {selectAll ? 'Tout désélectionner' : 'Tout sélectionner'}
              </Button>
              
              {selectedProducts.length > 0 && (
                <span className="text-sm text-white">
                  {selectedProducts.length} produit(s) sélectionné(s)
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {selectedProducts.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Supprimer la sélection
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer {selectedProducts.length} produit(s) ?
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-black bg-white hover:bg-gray-200" >Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={deleteSelectedProducts}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {products.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Tout supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer TOUS les produits ({products.length}) ?
                        Cette action est irréversible et très dangereuse.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-black bg-white hover:bg-gray-200" >Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={deleteAllProducts}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Tout supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-300 py-10">
            Aucun produit trouvé.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const stockInPieces = getStockInPieces(product);
              const minStockInPieces = getMinStockInPieces();
              const displayPrice = product.unit_price || product.price;
              const isLowStock = stockInPieces <= minStockInPieces;
              const isSelected = selectedProducts.includes(product.id);
              
              return (
                <div
                  key={product.id}
                  className={`p-5 border rounded-xl bg-gradient-to-br from-[#00624f]/90 to-[#004a3a]/90 text-white shadow-sm hover:shadow-md transition-all hover:from-[#00624f] hover:to-[#004a3a] ${
                    isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : 'border-white/20'
                  }`}
                  onClick={() => toggleProductSelection(product.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Square className="w-5 h-5 text-white/50" />
                      )}
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {product.name}
                        {isLowStock && (
                          <Badge variant="destructive" className="text-xs flex items-center gap-1 bg-amber-500">
                            <AlertTriangle className="w-3 h-3" />
                            Stock faible
                          </Badge>
                        )}
                      </h3>
                    </div>
                    
                    {/* Bouton de suppression individuel */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-300 hover:text-red-100 hover:bg-red-500/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer "{product.name}" ?
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={(e: { stopPropagation: () => void; }) => {
                              e.stopPropagation();
                              fetch(`/api/gyms/${gymId}/products/${product.id}`, {
                                method: 'DELETE',
                              }).then(() => {
                                toast.success('Produit supprimé avec succès');
                                fetchProducts();
                              });
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  <p className="text-sm text-gray-200 mb-1">
                    {product.product_categories.name} • {stockInPieces} pièces
                    {product.package_type !== 'single' && (
                      <span className="text-xs"> ({product.quantity} {product.unit})</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-300 mb-3">
                    {product.suppliers?.name ? `Fournisseur : ${product.suppliers.name}` : ''}
                  </p>
                  <p className="text-base font-medium text-white bg-white/10 p-2 rounded-lg text-center">
                    {displayPrice.toLocaleString()} XOF/pièce
                  </p>
                  {isLowStock && (
                    <p className="text-xs text-amber-300 mt-2">
                      ⚠️ Seuil d'alerte: {minStockInPieces} pièces
                    </p>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <Link href={`/gyms/${gymId}/stock/products/${product.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" className="shadow-sm bg-white/10 text-white border-white/20 hover:bg-white hover:text-[#00624f]">
                        Détails
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}