'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface PointOfSaleProps {
  gymId: string;
}

export default function PointOfSale({ gymId }: PointOfSaleProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [gymId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/gyms/${gymId}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.filter((p: Product) => p.quantity > 0));
      } else {
        toast.error('Erreur lors du chargement des produits');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    try {
      const response = await fetch('/api/check-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        }),
      });

      if (response.ok) {
        const stockCheck = await response.json();
        
        if (!stockCheck.hasEnoughStock) {
          toast.error(`Stock insuffisant. Il reste ${stockCheck.currentStock} unité(s)`);
          return;
        }

        const existingItem = cart.find(item => item.product_id === product.id);
        
        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;
          const stockResponse = await fetch('/api/check-stock', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: product.id,
              quantity: newQuantity
            }),
          });
          
          if (stockResponse.ok) {
            const stockCheck = await stockResponse.json();
            
            if (!stockCheck.hasEnoughStock) {
              toast.error(`Stock insuffisant. Il reste ${stockCheck.currentStock} unité(s)`);
              return;
            }
            
            setCart(cart.map(item =>
              item.product_id === product.id
                ? { ...item, quantity: newQuantity, total_price: newQuantity * item.unit_price }
                : item
            ));
          }
        } else {
          setCart([...cart, {
            product_id: product.id,
            name: product.name,
            quantity: 1,
            unit_price: product.price,
            total_price: product.price
          }]);
        }
      }
    } catch (error) {
      toast.error('Erreur de vérification du stock');
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    try {
      const response = await fetch('/api/check-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          quantity: newQuantity
        }),
      });

      if (response.ok) {
        const stockCheck = await response.json();
        
        if (!stockCheck.hasEnoughStock) {
          toast.error(`Stock insuffisant. Il reste ${stockCheck.currentStock} unité(s)`);
          return;
        }

        setCart(cart.map(item =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity, total_price: newQuantity * item.unit_price }
            : item
        ));
      }
    } catch (error) {
      toast.error('Erreur de vérification du stock');
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.total_price, 0);
  };

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    try {
      const response = await fetch(`/api/gyms/${gymId}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          payment_method: paymentMethod
        }),
      });

      if (response.ok) {
        toast.success('Vente enregistrée avec succès');
        setCart([]);
        fetchProducts();
      } else {
        toast.error('Erreur lors de la vente');
      }
    } catch (error) {
      toast.error('Erreur lors de la vente');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-[#005240] border-[#00c9a7] text-white">
        <CardHeader className="border-b border-[#00c9a7]">
          <CardTitle className="text-white">Produits Disponibles</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <Button
                key={product.id}
                variant="outline"
                className="h-auto flex flex-col items-center p-4 border-[#00c9a7] text-white"
                onClick={() => addToCart(product)}
              >
                <span className="font-semibold">{product.name}</span>
                <span className="text-sm">{product.price} XOF</span>
                <span className="text-xs text-gray-300">Stock: {product.quantity}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#005240] border-[#00c9a7] text-white">
        <CardHeader className="border-b border-[#00c9a7]">
          <CardTitle className="text-white">Panier</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between p-3 border border-[#00c9a7] rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm">{item.unit_price} XOF</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#00c9a7] text-white hover:bg-[#00c9a7] hover:text-[#00624f]"
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="min-w-[2rem] text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#00c9a7] text-white hover:bg-[#00c9a7] hover:text-[#00624f]"
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-600 hover:bg-red-900"
                    onClick={() => removeFromCart(item.product_id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {cart.length > 0 && (
              <>
                <div className="border-t border-[#00c9a7] pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{getTotal()} XOF</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Méthode de paiement</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 border border-[#00c9a7] rounded-md bg-[#00624f] text-white"
                  >
                    <option value="cash">Espèces</option>
                    <option value="card">Carte</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>

                <Button 
                  className="w-full bg-[#00c9a7] text-[#00624f] hover:bg-[#00b496]"
                  onClick={processSale}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Finaliser la vente
                </Button>
              </>
            )}

            {cart.length === 0 && (
              <p className="text-center text-gray-300 py-4">Le panier est vide</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}