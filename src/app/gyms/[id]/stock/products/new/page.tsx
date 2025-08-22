import ProductForm from '@/components/stock/ProductForm';
import { Card, CardContent } from '@/components/ui/card';

export default function NewProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête avec une jolie card dégradée */}
      <Card className="rounded-2xl shadow-xl bg-gradient-to-r from-blue-100 via-blue-100 to-green-800 text-black">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide drop-shadow-lg">
            🆕 {params.id ? ' Produit' : 'Nouveau Produit'}
          </h1>
          <p className="mt-2 text-black text-sm md:text-base">
          </p>
        </CardContent>
      </Card>

      {/* Composant principal */}
      <ProductForm gymId={params.id} />
    </div>
  );
}