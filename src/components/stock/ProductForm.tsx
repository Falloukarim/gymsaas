'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface ProductFormProps {
  gymId: string;
  product?: any;
}

export default function ProductForm({ gymId, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newSupplier, setNewSupplier] = useState({ 
    name: '', 
    contact_email: '', 
    contact_phone: '', 
    address: '' 
  });

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category_id: product?.category_id || '',
    description: product?.description || '',
    price: product?.price || '',
    cost_price: product?.cost_price || '',
    quantity: product?.quantity || 0,
    unit: product?.unit || 'pièce',
    supplier_id: product?.supplier_id || '',
    min_stock_level: product?.min_stock_level || 5,
    is_active: product?.is_active !== undefined ? product.is_active : true
  });

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, [gymId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/gyms/${gymId}/product-categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`/api/gyms/${gymId}/suppliers`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = product 
        ? `/api/gyms/${gymId}/products/${product.id}`
        : `/api/gyms/${gymId}/products`;
      
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price as string),
          cost_price: formData.cost_price ? parseFloat(formData.cost_price as string) : null,
          quantity: parseInt(formData.quantity as string),
          min_stock_level: parseInt(formData.min_stock_level as string)
        }),
      });

      if (response.ok) {
        toast.success(product ? 'Produit modifié avec succès' : 'Produit créé avec succès');
        router.push(`/gyms/${gymId}/stock/products`);
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Une erreur est survenue');
      }
    } catch (error) {
      toast.error('Erreur lors de la création du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/gyms/${gymId}/product-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        const category = await response.json();
        setCategories([...categories, category]);
        setFormData({ ...formData, category_id: category.id });
        setNewCategory({ name: '', description: '' });
        setShowCategoryForm(false);
        toast.success('Catégorie ajoutée avec succès');
      } else {
        toast.error('Erreur lors de l\'ajout de la catégorie');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la catégorie');
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/gyms/${gymId}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSupplier),
      });

      if (response.ok) {
        const supplier = await response.json();
        setSuppliers([...suppliers, supplier]);
        setFormData({ ...formData, supplier_id: supplier.id });
        setNewSupplier({ name: '', contact_email: '', contact_phone: '', address: '' });
        setShowSupplierForm(false);
        toast.success('Fournisseur ajouté avec succès');
      } else {
        toast.error('Erreur lors de l\'ajout du fournisseur');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du fournisseur');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl">
        <CardTitle className="text-2xl font-bold text-gray-800">
          {product ? 'Modifier le produit' : 'Nouveau produit'}
        </CardTitle>
        <CardDescription className="text-gray-300">
          {product ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit à votre inventaire'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom du produit */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Nom du produit *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Bouteille d'eau 1L"
                className="border-gray-300 focus:border-blue-500"
                required
              />
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <Label htmlFor="category_id" className="text-gray-300">Catégorie *</Label>
              <div className="flex gap-2">
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border bg-black border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {showCategoryForm && (
                <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Nouvelle catégorie</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCategoryForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Nom de la catégorie"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      className="border-gray-300"
                    />
                    <Input
                      placeholder="Description (optionnel)"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                      className="border-gray-300"
                    />
                    <Button type="button" onClick={handleAddCategory} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Ajouter
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Prix */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-300">Prix de vente (XOF) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="border-gray-300 focus:border-blue-500"
                required
              />
            </div>

            {/* Prix de revient */}
            <div className="space-y-2">
              <Label htmlFor="cost_price" className="text-gray-300">Prix de revient (XOF)</Label>
              <Input
                id="cost_price"
                name="cost_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={handleInputChange}
                className="border-gray-300 focus:border-blue-500"
              />
            </div>

            {/* Quantité */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-gray-300">Quantité initiale *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={handleInputChange}
                className="border-gray-300 focus:border-blue-500"
                required
              />
            </div>

            {/* Unité */}
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-gray-300">Unité de mesure *</Label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-black border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                required
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

            {/* Seuil minimum */}
            <div className="space-y-2">
              <Label htmlFor="min_stock_level" className="text-gray-300">Seuil d'alerte stock *</Label>
              <Input
                id="min_stock_level"
                name="min_stock_level"
                type="number"
                min="0"
                value={formData.min_stock_level}
                onChange={handleInputChange}
                className="border-gray-300 focus:border-blue-500"
                required
              />
            </div>

            {/* Fournisseur */}
            <div className="space-y-2">
              <Label htmlFor="supplier_id" className="text-gray-300">Fournisseur</Label>
              <div className="flex gap-2">
                <select
                  id="supplier_id"
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border bg-black border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSupplierForm(!showSupplierForm)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {showSupplierForm && (
                <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Nouveau fournisseur</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSupplierForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Nom du fournisseur"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                      className="border-gray-300"
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={newSupplier.contact_email}
                      onChange={(e) => setNewSupplier({...newSupplier, contact_email: e.target.value})}
                      className="border-gray-300"
                    />
                    <Input
                      placeholder="Téléphone"
                      value={newSupplier.contact_phone}
                      onChange={(e) => setNewSupplier({...newSupplier, contact_phone: e.target.value})}
                      className="border-gray-300"
                    />
                    <Input
                      placeholder="Adresse"
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                      className="border-gray-300"
                    />
                    <Button type="button" onClick={handleAddSupplier} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Ajouter
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
              placeholder="Description du produit..."
            />
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="is_active" className="text-gray-300">Statut</Label>
            <select
              id="is_active"
              name="is_active"
              value={formData.is_active.toString()}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/gyms/${gymId}/stock/products`)}
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {product ? 'Modifier' : 'Créer'} le produit
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}