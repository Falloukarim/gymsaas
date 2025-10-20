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
    price: product?.price?.toString() || '',
    cost_price: product?.cost_price?.toString() || '',
    quantity: product?.quantity?.toString() || '0',
    unit: product?.unit || 'pièce',
    supplier_id: product?.supplier_id || '',
    is_active: product?.is_active !== undefined ? product.is_active : true,
    package_type: product?.package_type || 'single',
    items_per_package: product?.items_per_package?.toString() || '1',
    package_price: product?.package_price?.toString() || '',
    package_cost_price: product?.package_cost_price?.toString() || '',
    unit_price: product?.unit_price?.toString() || '',
    unit_cost_price: product?.unit_cost_price?.toString() || ''
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

  const calculateUnitPrices = () => {
    if (formData.package_type === 'single') {
      setFormData(prev => ({
        ...prev,
        unit_price: prev.price,
        unit_cost_price: prev.cost_price
      }));
    } else {
      const itemsPerPackage = parseInt(formData.items_per_package) || 1;
      const packagePrice = parseFloat(formData.package_price) || 0;
      const packageCost = parseFloat(formData.package_cost_price) || 0;
      
      setFormData(prev => ({
        ...prev,
        unit_price: itemsPerPackage > 0 ? (packagePrice / itemsPerPackage).toFixed(2) : '0',
        unit_cost_price: itemsPerPackage > 0 ? (packageCost / itemsPerPackage).toFixed(2) : '0',
        price: packagePrice.toString(),
        cost_price: packageCost.toString()
      }));
    }
  };

  useEffect(() => {
    calculateUnitPrices();
  }, [formData.package_type, formData.items_per_package, formData.package_price, formData.package_cost_price]);

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
          // Conversion des champs numériques
          price: parseFloat(formData.price),
          cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
          package_price: formData.package_price ? parseFloat(formData.package_price) : null,
          package_cost_price: formData.package_cost_price ? parseFloat(formData.package_cost_price) : null,
          items_per_package: parseInt(formData.items_per_package),
          quantity: parseInt(formData.quantity),
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
    <div className="min-h-screen bg-gradient-to-br from-[#00624f] to-[#004a3a] p-4">
      <Card className="rounded-2xl shadow-xl border-0 bg-white/10 backdrop-blur-sm text-white max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/gyms/${gymId}/stock/products`)}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                {product ? 'Modifier le produit' : 'Nouveau produit'}
              </CardTitle>
              <CardDescription className="text-white/80 text-sm sm:text-base">
                {product ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit à votre inventaire'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Nom du produit */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white text-sm sm:text-base">Nom du produit *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Bouteille d'eau 1L"
                  className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 focus:border-green-400 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Type d'emballage */}
              <div className="space-y-2">
                <Label htmlFor="package_type" className="text-white text-sm sm:text-base">Type d'emballage *</Label>
                <select
                  id="package_type"
                  name="package_type"
                  value={formData.package_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white focus:border-green-400 focus:ring-green-400 text-sm sm:text-base"
                  required
                >
                  <option value="single" className="bg-[#00624f]">Produit unitaire</option>
                  <option value="package" className="bg-[#00624f]">Paquet</option>
                  <option value="carton" className="bg-[#00624f]">Carton</option>
                </select>
              </div>

              {formData.package_type !== 'single' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="items_per_package" className="text-white text-sm sm:text-base">
                      Nombre de pièces par {formData.package_type === 'package' ? 'paquet' : 'carton'} *
                    </Label>
                    <Input
                      id="items_per_package"
                      name="items_per_package"
                      type="number"
                      min="1"
                      value={formData.items_per_package}
                      onChange={handleInputChange}
                      className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 focus:border-green-400 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package_cost_price" className="text-white text-sm sm:text-base">
                      Cout du {formData.package_type === 'package' ? 'paquet' : 'carton'} (XOF)
                    </Label>
                    <Input
                      id="package_cost_price"
                      name="package_cost_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.package_cost_price}
                      onChange={handleInputChange}
                      className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 focus:border-green-400 text-sm sm:text-base"
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="package_price" className="text-white text-sm sm:text-base">
                      Prix du {formData.package_type === 'package' ? 'paquet' : 'carton'} (XOF) *
                    </Label>
                    <Input
                      id="package_price"
                      name="package_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.package_price}
                      onChange={handleInputChange}
                      className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 focus:border-green-400 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div className="p-3 sm:p-4 border border-white/20 rounded-md bg-white/10">
                    <h4 className="font-medium text-white mb-2 text-sm sm:text-base">Prix unitaire calculé</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white text-xs sm:text-sm">Prix de vente unitaire:</Label>
                        <p className="text-green-300 font-semibold text-sm sm:text-base">{formData.unit_price} XOF</p>
                      </div>
                      <div>
                        <Label className="text-white text-xs sm:text-sm">Prix de revient unitaire:</Label>
                        <p className="text-green-300 font-semibold text-sm sm:text-base">{formData.unit_cost_price} XOF</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {formData.package_type === 'single' && (
                <>
                
                  <div className="space-y-2">
                    <Label htmlFor="cost_price" className="text-white text-sm sm:text-base">Cout unitaire (XOF)</Label>
                    <Input
                      id="cost_price"
                      name="cost_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost_price}
                      onChange={handleInputChange}
                      className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 focus:border-green-400 text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-white text-sm sm:text-base">Prix de vente unitaire (XOF) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 focus:border-green-400 text-sm sm:text-base"
                      required
                    />
                  </div>

                </>
              )}

              {/* Catégorie */}
              <div className="space-y-2">
                <Label htmlFor="category_id" className="text-white text-sm sm:text-base">Catégorie *</Label>
                <div className="flex gap-2">
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white focus:border-green-400 focus:ring-green-400 text-sm sm:text-base"
                    required
                  >
                    <option value="" className="bg-[#00624f]">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-[#00624f]">
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowCategoryForm(!showCategoryForm)}
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20 h-10 w-10 flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {showCategoryForm && (
                  <div className="p-3 sm:p-4 border border-white/20 rounded-md bg-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white text-sm sm:text-base">Nouvelle catégorie</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowCategoryForm(false)}
                        className="text-white hover:bg-white/20 h-6 w-6"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Nom de la catégorie"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 text-sm"
                      />
                      <Input
                        placeholder="Description (optionnel)"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                        className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 text-sm"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddCategory} 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantité */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-white text-sm sm:text-base">Quantité initiale *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 focus:border-green-400 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Unité */}
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-white text-sm sm:text-base">Unité de mesure *</Label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white focus:border-green-400 focus:ring-green-400 text-sm sm:text-base"
                  required
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

              {/* Fournisseur */}
              <div className="space-y-2">
                <Label htmlFor="supplier_id" className="text-white text-sm sm:text-base">Fournisseur</Label>
                <div className="flex gap-2">
                  <select
                    id="supplier_id"
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white focus:border-green-400 focus:ring-green-400 text-sm sm:text-base"
                  >
                    <option value="" className="bg-[#00624f]">Sélectionner un fournisseur</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id} className="bg-[#00624f]">
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSupplierForm(!showSupplierForm)}
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20 h-10 w-10 flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {showSupplierForm && (
                  <div className="p-3 sm:p-4 border border-white/20 rounded-md bg-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white text-sm sm:text-base">Nouveau fournisseur</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSupplierForm(false)}
                        className="text-white hover:bg-white/20 h-6 w-6"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Nom du fournisseur"
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                        className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 text-sm"
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={newSupplier.contact_email}
                        onChange={(e) => setNewSupplier({...newSupplier, contact_email: e.target.value})}
                        className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 text-sm"
                      />
                      <Input
                        placeholder="Téléphone"
                        value={newSupplier.contact_phone}
                        onChange={(e) => setNewSupplier({...newSupplier, contact_phone: e.target.value})}
                        className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 text-sm"
                      />
                      <Input
                        placeholder="Adresse"
                        value={newSupplier.address}
                        onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                        className="border-white/20 bg-white/10 text-white placeholder:text-gray-300 text-sm"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddSupplier} 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white text-sm sm:text-base">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white placeholder:text-gray-300 focus:border-green-400 focus:ring-green-400 text-sm sm:text-base"
                placeholder="Description du produit..."
              />
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label htmlFor="is_active" className="text-white text-sm sm:text-base">Statut</Label>
              <select
                id="is_active"
                name="is_active"
                value={formData.is_active.toString()}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white focus:border-green-400 focus:ring-green-400 text-sm sm:text-base"
              >
                <option value="true" className="bg-[#00624f]">Actif</option>
                <option value="false" className="bg-[#00624f]">Inactif</option>
              </select>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-white/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/gyms/${gymId}/stock/products`)}
                className="flex items-center justify-center gap-2 border-white/20 bg-white/10 text-white hover:bg-white hover:text-[#00624f] order-2 sm:order-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white order-1 sm:order-2"
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
    </div>
  );
}