import ProductList from '@/components/stock/ProductList';
import { Card, CardContent } from '@/components/ui/card';

export default function ProductsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête avec une jolie card dégradée */}
      <Card className="rounded-2xl shadow-xl bg-gradient-to-r from-blue-100 via-blue-100 to-green-800 text-black">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide drop-shadow-lg">
            📦 Gestion des Produits
          </h1>
          <p className="mt-2 text-black text-sm md:text-base">
            Gérez votre inventaire et suivez vos stocks en temps réel
          </p>
        </CardContent>
      </Card>

      {/* Composant principal */}
      <ProductList gymId={params.id} />
    </div>
  );
}