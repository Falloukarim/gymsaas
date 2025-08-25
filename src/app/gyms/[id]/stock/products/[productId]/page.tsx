'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Minus, Save, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLoading } from '@/components/LoadingProvider'; // Import du hook useLoading

interface Product {
  id: string;
  name: string;
  category_id: string;
  product_categories: { name: string };
  description: string;
  price: number;
  cost_price: number;
  quantity: number;
  unit: string;
  supplier_id: string;
  suppliers?: { name: string };
  min_stock_level: number;
  is_active: boolean;
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
  const [showRestockForm, setShowRestockForm] = useState(false);
  const { startLoading } = useLoading(); // Utilisation du hook useLoading

  useEffect(() => {
    fetchProductData();
  }, [gymId, productId]);

  const fetchProductData = async () => {
    // Utilisation de startLoading pour wrapper l'opération
    await startLoading(async () => {
      try {
        setLoading(true);
        
        // Charger les détails du produit
        const productResponse = await fetch(`/api/gyms/${gymId}/products/${productId}`);
        if (productResponse.ok) {
          const productData = await productResponse.json();
          setProduct(productData);
        } else {
          toast.error('Erreur lors du chargement du produit');
        }

        // Charger les mouvements de stock
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

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restockQuantity <= 0) {
      toast.error('La quantité doit être positive');
      return;
    }

    // Utilisation de startLoading pour wrapper l'opération
    await startLoading(async () => {
      setUpdating(true);
      try {
        const response = await fetch(`/api/gyms/${gymId}/stock-movements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: productId,
            type: 'in',
            quantity: restockQuantity,
            reason: restockReason,
            note: `Réapprovisionnement manuel`
          }),
        });

        if (response.ok) {
          toast.success('Stock mis à jour avec succès');
          setRestockQuantity(1);
          setShowRestockForm(false);
          fetchProductData(); // Recharger les données
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

    // Utilisation de startLoading pour wrapper l'opération
    await startLoading(async () => {
      setUpdating(true);
      try {
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
            unit: product.unit,
            supplier_id: product.supplier_id,
            min_stock_level: product.min_stock_level,
            is_active: product.is_active
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/gyms/${gymId}/stock/products`)}
          className="border-white/20 text-white bg-green hover:text-[#00624f]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux produits
        </Button>
        <h1 className="text-2xl font-bold text-white">{product.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carte d'information du produit */}
        <Card className="border-0 bg-gradient-to-r from-[#00624f] to-[#004a3a] text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Informations du Produit</CardTitle>
            <CardDescription className="text-gray-200">Détails et statistiques du produit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-white">Nom</Label>
                <Input
                  value={product.name}
                  onChange={(e) => setProduct({...product, name: e.target.value})}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-white">Catégorie</Label>
                <Input
                  value={product.product_categories?.name || ''}
                  disabled
                  className="mt-1 bg-white/10 border-white/20 text-gray-300"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-white">Description</Label>
              <textarea
                value={product.description || ''}
                onChange={(e) => setProduct({...product, description: e.target.value})}
                className="w-full p-2 border border-white/20 rounded-md mt-1 min-h-20 bg-white/10 text-white placeholder:text-gray-300"
                placeholder="Description du produit..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-white">Prix de vente (XOF)</Label>
                <Input
                  type="number"
                  value={product.price}
                  onChange={(e) => setProduct({...product, price: parseFloat(e.target.value) || 0})}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-white">Prix de revient (XOF)</Label>
                <Input
                  type="number"
                  value={product.cost_price || ''}
                  onChange={(e) => setProduct({...product, cost_price: parseFloat(e.target.value) || null})}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-white">Stock actuel</Label>
                <Input
                  type="number"
                  value={product.quantity}
                  onChange={(e) => setProduct({...product, quantity: parseInt(e.target.value) || 0})}
                  className="mt-1 font-bold text-lg bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-white">Seuil d'alerte</Label>
                <Input
                  type="number"
                  value={product.min_stock_level}
                  onChange={(e) => setProduct({...product, min_stock_level: parseInt(e.target.value) || 0})}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-white">Unité</Label>
                <select
                  value={product.unit}
                  onChange={(e) => setProduct({...product, unit: e.target.value})}
                  className="w-full p-2 border border-white/20 rounded-md mt-1 bg-white/10 text-white"
                >
                  <option value="pièce" className="bg-[#00624f]">Pièce</option>
                  <option value="paquet" className="bg-[#00624f]">Paquet</option>
                  <option value="carton" className="bg-[#00624f]">Carton</option>
                  <option value="kg" className="bg-[#00624f]">Kilogramme</option>
                  <option value="g" className="bg-[#00624f]">Gramme</option>
                  <option value="L" className="bg-[#00624f]">Litre</option>
                  <option value="mL" className="bg-[#00624f]">Millilitre</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-white">Fournisseur</Label>
                <Input
                  value={product.suppliers?.name || 'Aucun'}
                  disabled
                  className="mt-1 bg-white/10 border-white/20 text-gray-300"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-white">Statut</Label>
              <select
                value={product.is_active ? 'true' : 'false'}
                onChange={(e) => setProduct({...product, is_active: e.target.value === 'true'})}
                className="w-full p-2 border border-white/20 rounded-md mt-1 bg-white/10 text-white"
              >
                <option value="true" className="bg-[#00624f]">Actif</option>
                <option value="false" className="bg-[#00624f]">Inactif</option>
              </select>
            </div>

            <Button 
              onClick={handleUpdateProduct} 
              disabled={updating}
              className="w-full bg-white text-[#00624f] hover:bg-gray-100"
            >
              {updating ? 'Mise à jour...' : 'Mettre à jour le produit'}
            </Button>
          </CardContent>
        </Card>

        {/* Carte de gestion de stock */}
        <Card className="border-0 bg-gradient-to-r from-[#00624f] to-[#004a3a] text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Gestion de Stock</CardTitle>
            <CardDescription className="text-gray-200">Réapprovisionnement et historique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Statistiques de stock */}
            <div className="bg-white/10 p-4 rounded-lg border border-white/20">
              <h3 className="font-semibold text-white">État du Stock</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-200">Stock actuel</p>
                  <p className="text-2xl font-bold text-white">{product.quantity} {product.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-200">Seuil d'alerte</p>
                  <p className="text-2xl font-bold text-white">{product.min_stock_level} {product.unit}</p>
                </div>
              </div>
              {product.quantity <= product.min_stock_level && (
                <div className="mt-2 p-2 bg-amber-500/20 border border-amber-500/30 rounded">
                  <p className="text-amber-200 text-sm">
                    ⚠️ Stock faible - Pensez à réapprovisionner
                  </p>
                </div>
              )}
            </div>

            {/* Formulaire de réapprovisionnement */}
            {showRestockForm ? (
              <form onSubmit={handleRestock} className="space-y-3 p-4 border border-white/20 rounded-lg bg-white/5">
                <h4 className="font-medium text-white">Réapprovisionnement</h4>
                <div>
                  <Label className="text-sm text-white">Quantité à ajouter</Label>
                  <Input
                    type="number"
                    min="1"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 1)}
                    className="mt-1 bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm text-white">Raison</Label>
                  <Input
                    value={restockReason}
                    onChange={(e) => setRestockReason(e.target.value)}
                    className="mt-1 bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updating}
                    className="bg-white text-[#00624f] hover:bg-gray-100"
                  >
                    {updating ? 'Traitement...' : 'Valider'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowRestockForm(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            ) : (
              <Button 
                onClick={() => setShowRestockForm(true)}
                className="w-full bg-white text-[#00624f] hover:bg-gray-100"
              >
                <Plus className="w-4 h-4 mr-2" />
                Réapprovisionner le stock
              </Button>
            )}

            {/* Historique des mouvements récents */}
            <div>
              <h4 className="font-medium text-white mb-3">Derniers mouvements</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {movements.length > 0 ? (
                  movements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-2 border border-white/20 rounded bg-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {movement.type === 'in' ? '➕ Entrée' : '➖ Sortie'} de {movement.quantity} {product.unit}
                        </p>
                        <p className="text-xs text-gray-200">
                          {movement.reason} • {new Date(movement.created_at).toLocaleDateString()}
                        </p>
                        {movement.note && (
                          <p className="text-xs text-gray-300">{movement.note}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-300">
                        {movement.users?.full_name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-300 text-center py-4">
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