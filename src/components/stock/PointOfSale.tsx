'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus, ShoppingCart, Trash2, TrendingUp, BarChart3, Calendar, DollarSign, RefreshCw, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLoading } from '@/components/LoadingProvider';
import { Input } from '@/components/ui/input';

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
  product_categories?: { name: string };
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const { startLoading } = useLoading();

  useEffect(() => {
    fetchProducts();
    fetchSalesStats();
  }, [gymId]);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_categories?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/gyms/${gymId}/products`);
      if (response.ok) {
        const data = await response.json();
        const availableProducts = data.filter((p: Product) => {
          const stockInPieces = getStockInPieces(p);
          return stockInPieces > 0;
        });
        setProducts(availableProducts);
        setFilteredProducts(availableProducts);
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
          fetchSalesStats();
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
      <Card className="lg:col-span-1 shadow-lg rounded-2xl border-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <CardHeader className="border-b border-white/20 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tableau de Bord
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
          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Panier actuel</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-green-400">
              {getTotalProfit().toLocaleString()} XOF
            </p>
            <p className="text-xs text-gray-300 mt-1">Bénéfice estimé</p>
          </div>

          {/* Bénéfice journalier */}
          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Aujourd'hui</span>
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-amber-300">
              {salesStats.daily_profit.toLocaleString()} XOF
            </p>
            <p className="text-xs text-gray-300 mt-1">Bénéfice du jour</p>
          </div>

          {/* Bénéfice total */}
          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Total</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-cyan-300">
              {salesStats.total_profit.toLocaleString()} XOF
            </p>
            <p className="text-xs text-gray-300 mt-1">Bénéfice global</p>
          </div>

          {/* Bénéfices par produit (dans le panier) */}
          {cart.length > 0 && (
            <div className="bg-white/10 p-4 rounded-xl border border-white/20">
              <h4 className="text-sm font-semibold mb-3 text-gray-200">Détails du panier</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {getCartProductProfits().map((product, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="truncate max-w-[80px] font-medium">{product.product_name}</span>
                    <div className="text-right">
                      <span className="text-green-400 font-bold block">
                        +{product.profit.toLocaleString()} XOF
                      </span>
                      <span className="text-gray-400 text-[10px]">
                        {product.quantity_sold} unité(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top produits rentables (historique) */}
          {salesStats.product_profits.length > 0 && (
            <div className="bg-white/10 p-4 rounded-xl border border-white/20">
              <h4 className="text-sm font-semibold mb-3 text-gray-200">Top Produits</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {salesStats.product_profits.slice(0, 5).map((product, index) => (
                  <div key={product.product_id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-yellow-400' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-blue-400'
                      }`} />
                      <span className="truncate max-w-[70px] font-medium">{product.product_name}</span>
                    </div>
                    <span className="text-green-400 font-bold">
                      +{product.profit.toLocaleString()} XOF
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {salesStats.product_profits.length === 0 && cart.length === 0 && (
            <div className="text-center py-6">
              <BarChart3 className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-300 text-sm">
                {statsLoading ? 'Chargement...' : 'Aucune donnée disponible'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Produits disponibles */}
      <Card className="lg:col-span-2 shadow-lg rounded-2xl border-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <CardHeader className="border-b border-white/10 pb-4">
          <div className="flex flex-col space-y-4">
            <CardTitle className="text-white text-xl">📦 Produits en Stock</CardTitle>
            
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un produit ou catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-400"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const unitPrice = getUnitPrice(product);
              const unitCost = getUnitCost(product);
              const unitProfit = unitCost ? unitPrice - unitCost : null;
              const stockInPieces = getStockInPieces(product);
              const profitPercentage = unitCost ? ((unitPrice - unitCost) / unitCost) * 100 : 0;
              
              return (
                <div
                  key={product.id}
                  className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-3 border border-white/10 hover:border-blue-400/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  {/* Badge de catégorie */}
                  {product.product_categories?.name && (
                    <div className="absolute -top-2 -right-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {product.product_categories.name}
                      </span>
                    </div>
                  )}

                  {/* Badge de profit */}
                  {unitProfit !== null && unitProfit > 0 && (
                    <div className="absolute -top-2 -left-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        profitPercentage > 50 ? 'bg-green-500 text-white' :
                        profitPercentage > 20 ? 'bg-amber-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        +{profitPercentage.toFixed(0)}%
                      </span>
                    </div>
                  )}

                  <div className="text-center space-y-2">
                    {/* Nom du produit */}
                    <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-blue-300 transition-colors">
                      {product.name}
                    </h3>

                    {/* Prix */}
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-green-400">
                        {unitPrice} XOF
                      </p>
                      <p className="text-xs text-gray-400">par pièce</p>
                    </div>

                    {/* Informations de bénéfice */}
                    {unitProfit !== null && (
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-xs text-green-300 font-semibold">
                          +{unitProfit} XOF profit
                        </p>
                      </div>
                    )}

                    {/* Stock */}
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      stockInPieces > 20 ? 'bg-green-500/20 text-green-300' :
                      stockInPieces > 5 ? 'bg-amber-500/20 text-amber-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {stockInPieces} pièce(s) disponible(s)
                    </div>

                    {/* Bouton d'ajout */}
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 group-hover:scale-105"
                      disabled={stockInPieces === 0}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-300">Aucun produit trouvé</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? 'Essayez une autre recherche' : 'Aucun produit en stock'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panier */}
      <Card className="shadow-lg rounded-2xl border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Panier
            {cart.length > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {cart.length} article(s)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.product_id} className="bg-black rounded-xl p-3 border border-white/10 hover:border-green-400/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div>
                        <span className="text-gray-400">Prix unitaire:</span>
                        <p className="text-white font-medium">{item.unit_price} XOF</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Total:</span>
                        <p className="text-green-400 font-bold">{item.total_price} XOF</p>
                      </div>
                    </div>

                    {item.cost_price && (
                      <div className="mt-2 p-2 bg-white/5 rounded-lg">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Coût:</span>
                          <span className="text-red-300">{item.total_cost} XOF</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-400">Bénéfice:</span>
                          <span className="text-green-300 font-bold">
                            +{item.profit} XOF
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2 ml-3">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 border-white/20 text-black hover:bg-red-500/20 hover:border-red-400"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      
                      <span className="min-w-[2rem] text-center font-bold text-lg text-white">
                        {item.quantity}
                      </span>
                      
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 border-white/20 text-black hover:bg-green-500/20 hover:border-green-400"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-red-300 hover:text-red-100 hover:bg-red-500/20"
                      onClick={() => removeFromCart(item.product_id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {cart.length > 0 && (
              <>
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">Sous-total:</span>
                    <span className="text-white font-semibold">{getTotal().toLocaleString()} XOF</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">Coût total:</span>
                    <span className="text-red-300">{getTotalCost().toLocaleString()} XOF</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-white/10">
                    <span className="text-green-300">Bénéfice total:</span>
                    <span className="text-green-400">
                      +{getTotalProfit().toLocaleString()} XOF
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">Méthode de paiement</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-3 border border-white/20 rounded-xl bg-white/5 text-white focus:border-green-400 focus:ring-green-400 transition-all"
                  >
                    <option value="cash" className="bg-slate-800">💵 Espèces</option>
                    <option value="card" className="bg-slate-800">💳 Carte bancaire</option>
                    <option value="mobile_money" className="bg-slate-800">📱 Mobile Money</option>
                  </select>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={processSale}
                  disabled={processingSale}
                >
                  {processingSale ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Finaliser la vente • {getTotal().toLocaleString()} XOF
                    </>
                  )}
                </Button>
              </>
            )}

            {cart.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-300 text-lg font-medium">Panier vide</p>
                <p className="text-gray-400 text-sm mt-1">
                  Ajoutez des produits pour commencer une vente
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}