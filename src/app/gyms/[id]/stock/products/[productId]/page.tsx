'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Minus, Save, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLoading } from '@/components/LoadingProvider';

interface Product {
  id: string;
  name: string;
  category_id: string;
  product_categories: { name: string };
  description: string;
  price: number;
  cost_price: number;
  quantity: number;
  stock_in_pieces: number;
  unit: string;
  supplier_id: string;
  suppliers?: { name: string };
  min_stock_level: number;
  is_active: boolean;
  package_type: string;
  items_per_package: number;
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  note: string;
  created_at: string;
  users: { full_name: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gymId = params.id as string;
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [restockReason, setRestockReason] = useState('Réapprovisionnement');
  const [restockType, setRestockType] = useState<'pieces' | 'packages'>('pieces');
  const [showRestockForm, setShowRestockForm] = useState(false);
  const { startLoading } = useLoading();

  useEffect(() => {
    fetchProductData();
  }, [gymId, productId]);

  const fetchProductData = async () => {
    await startLoading(async () => {
      try {
        setLoading(true);
        
        const productResponse = await fetch(`/api/gyms/${gymId}/products/${productId}`);
        if (productResponse.ok) {
          const productData = await productResponse.json();
          setProduct(productData);
        } else {
          toast.error('Erreur lors du chargement du produit');
        }

        const movementsResponse = await fetch(`/api/gyms/${gymId}/stock-movements?product_id=${productId}&limit=20`);
        if (movementsResponse.ok) {
          const movementsData = await movementsResponse.json();
          setMovements(movementsData);
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    });
  };

  // Calculer le nombre de pièces et paquets
  const getPiecesAndPackages = () => {
    if (!product) return { pieces: 0, packages: 0, remainingPieces: 0 };
    
    const stockInPieces = product.stock_in_pieces;
    
    if (product.package_type === 'single') {
      return {
        pieces: stockInPieces,
        packages: stockInPieces,
        remainingPieces: 0
      };
    }
    
    const itemsPerPackage = product.items_per_package || 1;
    const packages = Math.floor(stockInPieces / itemsPerPackage);
    const remainingPieces = stockInPieces % itemsPerPackage;
    
    return { pieces: stockInPieces, packages, remainingPieces };
  };

  // Seuil d'alerte fixé à 10 pièces
  const getMinStockInPieces = () => {
    return 10;
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restockQuantity <= 0) {
      toast.error('La quantité doit être positive');
      return;
    }

    await startLoading(async () => {
      setUpdating(true);
      try {
        // Calculer la quantité en pièces
        let quantityInPieces = restockQuantity;
        if (restockType === 'packages' && product) {
          quantityInPieces = restockQuantity * (product.items_per_package || 1);
        }

        const response = await fetch(`/api/gyms/${gymId}/stock-movements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: productId,
            type: 'in',
            quantity: quantityInPieces,
            reason: restockReason,
            note: `Réapprovisionnement de ${restockQuantity} ${restockType === 'pieces' ? 'pièces' : 'paquets'}`
          }),
        });

        if (response.ok) {
          toast.success('Stock mis à jour avec succès');
          setRestockQuantity(1);
          setRestockType('pieces');
          setShowRestockForm(false);
          fetchProductData();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Erreur lors de la mise à jour du stock');
        }
      } catch (error) {
        toast.error('Erreur lors de la mise à jour du stock');
      } finally {
        setUpdating(false);
      }
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    await startLoading(async () => {
      setUpdating(true);
      try {
        // Calculer le stock en pièces pour la mise à jour
        let stockInPieces = product.stock_in_pieces;
        
        // Si le type d'emballage change, recalculer le stock
        if (product.package_type !== 'single') {
          const itemsPerPackage = product.items_per_package || 1;
          stockInPieces = product.quantity * itemsPerPackage;
        }

        const response = await fetch(`/api/gyms/${gymId}/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: product.name,
            category_id: product.category_id,
            description: product.description,
            price: product.price,
            cost_price: product.cost_price,
            quantity: product.quantity,
            stock_in_pieces: stockInPieces,
            unit: product.unit,
            supplier_id: product.supplier_id,
            min_stock_level: 10,
            is_active: product.is_active,
            package_type: product.package_type,
            items_per_package: product.items_per_package
          }),
        });

        if (response.ok) {
          toast.success('Produit mis à jour avec succès');
          const updatedProduct = await response.json();
          setProduct(updatedProduct);
        } else {
          const error = await response.json();
          toast.error(error.error || 'Erreur lors de la mise à jour');
        }
      } catch (error) {
        toast.error('Erreur lors de la mise à jour');
      } finally {
        setUpdating(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.push(`/gyms/${gymId}/stock/products`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.push(`/gyms/${gymId}/stock/products`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
        <div>Produit non trouvé</div>
      </div>
    );
  }

  const { pieces, packages, remainingPieces } = getPiecesAndPackages();
  const minStockInPieces = getMinStockInPieces();
  const isLowStock = pieces <= minStockInPieces;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/gyms/${gymId}/stock/products`)}
          className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux produits
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Informations du Produit</CardTitle>
            <CardDescription className="text-gray-600">Détails et statistiques du produit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ... (le reste du formulaire reste inchangé) ... */}

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Stock détaillé</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total pièces</p>
                  <p className="text-2xl font-bold text-gray-900">{pieces} pièces</p>
                </div>
                
                {product.package_type !== 'single' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Paquets complets</p>
                      <p className="text-2xl font-bold text-gray-900">{packages}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Pièces/paquet</p>
                      <p className="text-2xl font-bold text-gray-900">{product.items_per_package}</p>
                    </div>
                  </>
                )}
              </div>

              {isLowStock && (
                <div className="mt-2 p-2 bg-amber-100 border border-amber-300 rounded">
                  <p className="text-amber-800 text-sm">
                    ⚠️ Stock faible - Seuil d'alerte: {minStockInPieces} pièces
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Unité</Label>
                <select
                  value={product.unit}
                  onChange={(e) => setProduct({...product, unit: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                >
                  <option value="pièce">Pièce</option>
                  <option value="paquet">Paquet</option>
                  <option value="carton">Carton</option>
                  <option value="kg">Kilogramme</option>
                  <option value="g">Gramme</option>
                  <option value="L">Litre</option>
                  <option value="mL">Millilitre</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Fournisseur</Label>
                <Input
                  value={product.suppliers?.name || 'Aucun'}
                  disabled
                  className="mt-1 bg-gray-100"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Statut</Label>
              <select
                value={product.is_active ? 'true' : 'false'}
                onChange={(e) => setProduct({...product, is_active: e.target.value === 'true'})}
                className="w-full p-2 border border-gray-300 rounded-md mt-1"
              >
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>

            <Button 
              onClick={handleUpdateProduct} 
              disabled={updating}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {updating ? 'Mise à jour...' : 'Mettre à jour le produit'}
            </Button>
          </CardContent>
        </Card>

        {/* Carte de gestion de stock */}
        <Card className="border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Gestion de Stock</CardTitle>
            <CardDescription className="text-gray-600">Réapprovisionnement et historique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Statistiques de stock */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900">État du Stock</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-600">Stock total</p>
                  <p className="text-2xl font-bold text-gray-900">{pieces} pièces</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Seuil d'alerte</p>
                  <p className="text-2xl font-bold text-gray-900">{minStockInPieces} pièces</p>
                </div>
              </div>
              {isLowStock && (
                <div className="mt-2 p-2 bg-amber-100 border border-amber-300 rounded">
                  <p className="text-amber-800 text-sm">
                    ⚠️ Stock faible - Pensez à réapprovisionner
                  </p>
                </div>
              )}
            </div>

            {/* Formulaire de réapprovisionnement */}
            {showRestockForm ? (
              <form onSubmit={handleRestock} className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-900">Réapprovisionnement</h4>
                
                {product.package_type !== 'single' && (
                  <div>
                    <Label className="text-sm text-gray-700">Type de réapprovisionnement</Label>
                    <select
                      value={restockType}
                      onChange={(e) => setRestockType(e.target.value as 'pieces' | 'packages')}
                      className="w-full p-2 border border-gray-300 rounded-md mt-1"
                    >
                      <option value="pieces">Pièces</option>
                      <option value="packages">Paquets</option>
                    </select>
                  </div>
                )}

                <div>
                  <Label className="text-sm text-gray-700">
                    Quantité à ajouter ({restockType === 'pieces' ? 'pièces' : 'paquets'})
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 1)}
                    className="mt-1"
                    required
                  />
                  {restockType === 'packages' && product && (
                    <p className="text-xs text-gray-500 mt-1">
                      Équivalent à {restockQuantity * (product.items_per_package || 1)} pièces
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm text-gray-700">Raison</Label>
                  <Input
                    value={restockReason}
                    onChange={(e) => setRestockReason(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updating ? 'Traitement...' : 'Valider'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowRestockForm(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            ) : (
              <Button 
                onClick={() => setShowRestockForm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Réapprovisionner le stock
              </Button>
            )}

            {/* Historique des mouvements récents */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Derniers mouvements</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {movements.length > 0 ? (
                  movements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-2 border border-gray-200 rounded bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {movement.type === 'in' ? '➕ Entrée' : '➖ Sortie'} de {movement.quantity} pièces
                        </p>
                        <p className="text-xs text-gray-600">
                          {movement.reason} • {new Date(movement.created_at).toLocaleDateString()}
                        </p>
                        {movement.note && (
                          <p className="text-xs text-gray-500">{movement.note}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {movement.users?.full_name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucun mouvement de stock enregistré
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}