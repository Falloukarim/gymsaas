import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gymId = params.id;
  const { items, payment_method, total_amount, total_profit } = await request.json();

  try {
    // Vérifier d'abord que tous les produits ont suffisamment de stock en pièces
    for (const item of items) {
      const { data: product, error: productError } = await (await supabase)
        .from('products')
        .select('stock_in_pieces, name')
        .eq('id', item.product_id)
        .single();

      if (productError) {
        return NextResponse.json({ 
          error: `Erreur produit: ${productError.message}` 
        }, { status: 500 });
      }

      // Vérifier le stock en pièces
      if (product.stock_in_pieces < item.quantity) {
        return NextResponse.json({ 
          error: `Stock insuffisant pour ${product.name}. Stock disponible: ${product.stock_in_pieces} pièces` 
        }, { status: 400 });
      }
    }

    // Créer la vente
    const { data: sale, error: saleError } = await (await supabase)
      .from('sales')
      .insert({
        gym_id: gymId,
        user_id: user.id,
        total_amount,
        total_profit: total_profit || 0,
        payment_method
      })
      .select()
      .single();

    if (saleError) {
      console.error('Sale error:', saleError);
      return NextResponse.json({ error: saleError.message }, { status: 500 });
    }

    // Créer les lignes de vente
    const saleItems = items.map((item: any) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await (await supabase)
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) {
      console.error('Sale items error:', itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Mettre à jour le stock pour chaque produit (en pièces)
    for (const item of items) {
      // Récupérer le produit actuel
      const { data: currentProduct, error: getError } = await (await supabase)
        .from('products')
        .select('stock_in_pieces, package_type, items_per_package, quantity')
        .eq('id', item.product_id)
        .single();

      if (getError) {
        console.error('Get product error:', getError);
        return NextResponse.json({ error: getError.message }, { status: 500 });
      }

      // Calculer le nouveau stock en pièces
      const newStockInPieces = currentProduct.stock_in_pieces - item.quantity;
      
      // Calculer le nouveau nombre de paquets complets (si applicable)
      let newQuantity = currentProduct.quantity;
      if (currentProduct.package_type !== 'single') {
        const itemsPerPackage = currentProduct.items_per_package || 1;
        newQuantity = Math.floor(newStockInPieces / itemsPerPackage);
      } else {
        newQuantity = newStockInPieces;
      }

      // Mettre à jour le produit
      const { error: updateError } = await (await supabase)
        .from('products')
        .update({ 
          quantity: newQuantity,
          stock_in_pieces: newStockInPieces,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.product_id);

      if (updateError) {
        console.error('Update product error:', updateError);
        return NextResponse.json({ 
          error: `Erreur mise à jour stock: ${updateError.message}` 
        }, { status: 500 });
      }

      // Créer le mouvement de stock
      const { error: stockError } = await (await supabase)
        .from('stock_movements')
        .insert({
          product_id: item.product_id,
          gym_id: gymId,
          user_id: user.id,
          type: 'out',
          quantity: item.quantity,
          reason: 'Vente',
          note: `Vente de ${item.quantity} pièce(s)`
        });

      if (stockError) {
        console.error('Stock movement error:', stockError);
      }
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Internal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// AJOUTER une méthode GET simple pour les ventes si nécessaire
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gymId = params.id;

  try {
    const { data: sales, error } = await (await supabase)
      .from('sales')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}