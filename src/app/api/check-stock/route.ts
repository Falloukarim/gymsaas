import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
    }

    // Récupérer le produit avec le stock en pièces
    const { data: product, error: productError } = await (await supabase)
      .from('products')
      .select('stock_in_pieces, quantity, name, package_type, items_per_package')
      .eq('id', productId)
      .single();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Vérifier le stock en utilisant le stock en pièces
    const hasEnoughStock = (product.stock_in_pieces || 0) >= quantity;
    
    return NextResponse.json({
      hasEnoughStock,
      currentStock: product.stock_in_pieces || 0,
      productName: product.name
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}