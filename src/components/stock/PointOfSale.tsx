'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus, ShoppingCart, Trash2, TrendingUp, BarChart3, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLoading } from '@/components/LoadingProvider';

interface Product {
  id: string;
  name: string;
  price: number;
  cost_price: number | null;
  quantity: number;
  stock_in_pieces: number;
  package_type: string;
  items_per_package: number;
  unit_price: number | null;
  unit_cost_price: number | null;
}

interface CartItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  cost_price: number | null;
  total_price: number;
  total_cost: number | null;
  profit: number | null;
}

interface SalesStats {
  daily_profit: number;
  total_profit: number;
  product_profits: Array<{
    product_id: string;
    product_name: string;
    profit: number;
    quantity_sold: number;
  }>;
}

interface PointOfSaleProps {
  gymId: string;
}

export default function PointOfSale({ gymId }: PointOfSaleProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [processingSale, setProcessingSale] = useState(false);
  const [salesStats, setSalesStats] = useState<SalesStats>({
    daily_profit: 0,
    total_profit: 0,
    product_profits: []
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const { startLoading } = useLoading();

  useEffect(() => {
    fetchProducts();
    fetchSalesStats();
  }, [gymId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/gyms/${gymId}/products`);
      if (response.ok) {
        const data = await response.json();
        // Filtrer les produits avec au moins 1 pièce en stock
        const availableProducts = data.filter((p: Product) => {
          const stockInPieces = getStockInPieces(p);
          return stockInPieces > 0;
        });
        setProducts(availableProducts);
      } else {
        toast.error('Erreur lors du chargement des produits');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(`/api/gyms/${gymId}/sales/stats`);
      if (response.ok) {
        const data = await response.json();
        setSalesStats(data);
      } else {
        console.error('Erreur lors du chargement des statistiques');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de vente:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const getUnitPrice = (product: Product): number => {
    return product.unit_price || product.price;
  };

  const getUnitCost = (product: Product): number | null => {
    return product.unit_cost_price || product.cost_price;
  };

  const getStockInPieces = (product: Product): number => {
    return product.stock_in_pieces || 0;
  };

  const addToCart = async (product: Product) => {
    await startLoading(async () => {
      try {
        const unitPrice = getUnitPrice(product);
        const unitCost = getUnitCost(product);
        const stockInPieces = getStockInPieces(product);
        
        if (stockInPieces < 1) {
          toast.error(`Stock insuffisant pour ${product.name}`);
          return;
        }

        const existingItem = cart.find(item => item.product_id === product.id);
        
        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;
          
          if (stockInPieces < newQuantity) {
            toast.error(`Stock insuffisant. Il reste ${stockInPieces} pièce(s)`);
            return;
          }
          
          setCart(cart.map(item =>
            item.product_id === product.id
              ? { 
                  ...item, 
                  quantity: newQuantity, 
                  total_price: newQuantity * item.unit_price,
                  total_cost: item.cost_price ? newQuantity * item.cost_price : null,
                  profit: item.cost_price ? (newQuantity * item.unit_price) - (newQuantity * item.cost_price) : null
                }
              : item
          ));
        } else {
          const newItem = {
            product_id: product.id,
            name: product.name,
            quantity: 1,
            unit_price: unitPrice,
            cost_price: unitCost,
            total_price: unitPrice,
            total_cost: unitCost,
            profit: unitCost ? unitPrice - unitCost : null
          };
          setCart([...cart, newItem]);
        }
      } catch (error) {
        toast.error('Erreur lors de l\'ajout au panier');
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    await startLoading(async () => {
      try {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const stockInPieces = getStockInPieces(product);
        
        if (stockInPieces < newQuantity) {
          toast.error(`Stock insuffisant. Il reste ${stockInPieces} pièce(s)`);
          return;
        }

        setCart(cart.map(item =>
          item.product_id === productId
            ? { 
                ...item, 
                quantity: newQuantity, 
                total_price: newQuantity * item.unit_price,
                total_cost: item.cost_price ? newQuantity * item.cost_price : null,
                profit: item.cost_price ? (newQuantity * item.unit_price) - (newQuantity * item.cost_price) : null
              }
            : item
        ));
      } catch (error) {
        toast.error('Erreur de mise à jour de la quantité');
      }
    });
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.total_price, 0);
  };

  const getTotalCost = () => {
    return cart.reduce((total, item) => total + (item.total_cost || 0), 0);
  };

  const getTotalProfit = () => {
    return cart.reduce((total, item) => total + (item.profit || 0), 0);
  };

  const getCartProductProfits = () => {
    return cart.map(item => ({
      product_id: item.product_id,
      product_name: item.name,
      profit: item.profit || 0,
      quantity_sold: item.quantity
    }));
  };

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    await startLoading(async () => {
      setProcessingSale(true);

      try {
        const response = await fetch(`/api/gyms/${gymId}/sales`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: cart,
            payment_method: paymentMethod,
            total_amount: getTotal(),
            total_profit: getTotalProfit()
          }),
        });

        if (response.ok) {
          toast.success('Vente enregistrée avec succès');
          setCart([]);
          fetchProducts();
          fetchSalesStats(); // Rafraîchir les statistiques après la vente
        } else {
          const error = await response.json();
          toast.error(error.error || 'Erreur lors de la vente');
        }
      } catch (error) {
        toast.error('Erreur lors de la vente');
      } finally {
        setProcessingSale(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Carte des bénéfices */}
      <Card className="lg:col-span-1 shadow-lg rounded-2xl border-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardHeader className="border-b border-white/20 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Statistiques des Bénéfices
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchSalesStats}
              disabled={statsLoading}
              className="text-white hover:bg-white/20"
              title="Rafraîchir les statistiques"
            >
              <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Bénéfice du panier actuel */}
          <div className="bg-white/10 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Bénéfice panier actuel</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-green-300">
              {getTotalProfit().toLocaleString()} XOF
            </p>
          </div>

          {/* Bénéfice journalier */}
          <div className="bg-white/10 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Bénéfice aujourd'hui</span>
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-yellow-300">
              {salesStats.daily_profit.toLocaleString()} XOF
            </p>
          </div>

          {/* Bénéfice total */}
          <div className="bg-white/10 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Bénéfice total</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-blue-300">
              {salesStats.total_profit.toLocaleString()} XOF
            </p>
          </div>

          {/* Bénéfices par produit (dans le panier) */}
          {cart.length > 0 && (
            <div className="bg-white/10 p-3 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Bénéfice par produit</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {getCartProductProfits().map((product, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="truncate max-w-[100px]">{product.product_name}</span>
                    <span className="text-green-300 font-medium">
                      +{product.profit.toLocaleString()} XOF
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top produits rentables (historique) */}
          {salesStats.product_profits.length > 0 && (
            <div className="bg-white/10 p-3 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Top produits rentables</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {salesStats.product_profits.slice(0, 5).map((product, index) => (
                  <div key={product.product_id} className="flex justify-between text-xs">
                    <span className="truncate max-w-[80px]">{product.product_name}</span>
                    <span className="text-green-300 font-medium">
                      +{product.profit.toLocaleString()} XOF
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {salesStats.product_profits.length === 0 && cart.length === 0 && (
            <p className="text-center text-gray-300 text-sm py-4">
              {statsLoading ? 'Chargement des statistiques...' : 'Aucune donnée de vente disponible'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Produits disponibles */}
      <Card className="lg:col-span-2 shadow-lg rounded-2xl border-0 bg-gradient-to-r from-[#00624f] to-[#004a3a] text-white">
        <CardHeader className="border-b border-white/20 pb-4">
          <CardTitle className="text-white">Produits Disponibles</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => {
              const unitPrice = getUnitPrice(product);
              const unitCost = getUnitCost(product);
              const unitProfit = unitCost ? unitPrice - unitCost : null;
              const stockInPieces = getStockInPieces(product);
              
              return (
                <Button
                  key={product.id}
                  variant="outline"
                  className="h-auto flex flex-col bg-green items-center p-4 border-white/20 text-black hover:bg-white/10 transition-all duration-200"
                  onClick={() => addToCart(product)}
                  disabled={stockInPieces === 0}
                >
                  <span className="font-semibold text-base mb-1">{product.name}</span>
                  <span className="text-sm font-medium">{unitPrice} XOF/pièce</span>
                  {unitProfit !== null && (
                    <span className="text-xs text-gray-300 mt-1">
                      Bénéfice: {unitProfit} XOF/pièce
                    </span>
                  )}
                  {product.package_type !== 'single' && (
                    <span className="text-xs text-gray-300 mt-1">
                      {product.items_per_package} pièces/paquet
                    </span>
                  )}
                  <span className={`text-xs font-medium mt-2 ${
                    stockInPieces === 0 ? 'text-red-300' : 'text-gray-300'
                  }`}>
                    Stock: {stockInPieces} pièces
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Panier */}
      <Card className="shadow-lg rounded-2xl border-0 bg-gradient-to-r from-[#00624f] to-[#004a3a] text-white">
        <CardHeader className="border-b border-white/20 pb-4">
          <CardTitle className="text-white">Panier</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between p-3 border border-white/20 rounded-lg bg-white/5">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>{item.unit_price} XOF × {item.quantity} pièces</p>
                    {item.cost_price && (
                      <>
                        <p>Coût: {item.total_cost?.toLocaleString()} XOF</p>
                        <p className="text-green-300">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          Bénéfice: {item.profit?.toLocaleString()} XOF
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white bg-green hover:text-[#00624f]"
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="min-w-[2rem] text-center font-medium">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white bg-green hover:text-[#00624f]"
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-300 hover:text-red-100 hover:bg-red-500/20"
                    onClick={() => removeFromCart(item.product_id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {cart.length > 0 && (
              <>
                <div className="border-t border-white/20 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Total vente:</span>
                    <span className="font-semibold">{getTotal().toLocaleString()} XOF</span>
                  </div>
                  
                  <div className="flex justify-between text-green-300">
                    <span>Bénéfice total:</span>
                    <span className="font-semibold">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      {getTotalProfit().toLocaleString()} XOF
                    </span>
                  </div>

                  {getTotalCost() > 0 && (
                    <div className="flex justify-between text-gray-300 text-sm">
                      <span>Coût total:</span>
                      <span>{getTotalCost().toLocaleString()} XOF</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Méthode de paiement</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 border border-white/20 rounded-md bg-white/10 text-white focus:border-green-400 focus:ring-green-400"
                  >
                    <option value="cash">Espèces</option>
                    <option value="card">Carte</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>

                <Button 
                  className="w-full bg-white text-[#00624f] hover:bg-gray-100 shadow font-semibold py-3"
                  onClick={processSale}
                  disabled={processingSale}
                >
                  {processingSale ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00624f] mr-2"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Finaliser la vente
                    </>
                  )}
                </Button>
              </>
            )}

            {cart.length === 0 && (
              <p className="text-center text-gray-300 py-6">Le panier est vide</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}