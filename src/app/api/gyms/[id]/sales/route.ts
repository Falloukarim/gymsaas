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
  const { items, payment_method } = await request.json();

  try {
    // Vérifier d'abord que tous les produits ont suffisamment de stock
    for (const item of items) {
      const { data: product, error: productError } = await (await supabase)
        .from('products')
        .select('quantity, name')
        .eq('id', item.product_id)
        .single();

      if (productError) {
        return NextResponse.json({ 
          error: `Erreur produit: ${productError.message}` 
        }, { status: 500 });
      }

      if (product.quantity < item.quantity) {
        return NextResponse.json({ 
          error: `Stock insuffisant pour ${product.name}. Stock disponible: ${product.quantity}` 
        }, { status: 400 });
      }
    }

    // Calculer le montant total
    const total_amount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);

    // Créer la vente
    const { data: sale, error: saleError } = await (await supabase)
      .from('sales')
      .insert({
        gym_id: gymId,
        user_id: user.id,
        total_amount,
        payment_method
      })
      .select()
      .single();

    if (saleError) {
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
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Mettre à jour le stock pour chaque produit
    // Mettre à jour le stock pour chaque produit
for (const item of items) {
  // Récupérer la quantité actuelle
  const { data: current, error: getError } = await (await supabase)
    .from('products')
    .select('quantity')
    .eq('id', item.product_id)
    .single()

  if (getError) {
    return NextResponse.json({ error: getError.message }, { status: 500 })
  }

  const newQuantity = current.quantity - item.quantity

  const { error: updateError } = await (await supabase)
    .from('products')
    .update({ 
      quantity: newQuantity,
      updated_at: new Date().toISOString()
    })
    .eq('id', item.product_id)

  if (updateError) {
    return NextResponse.json({ 
      error: `Erreur mise à jour stock: ${updateError.message}` 
    }, { status: 500 })
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
      reason: 'Vente'
    })

  if (stockError) {
    console.error('Error creating stock movement:', item.product_id, stockError)
  }
}


    return NextResponse.json(sale);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}