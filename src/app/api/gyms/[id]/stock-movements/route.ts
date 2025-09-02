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
  const body = await request.json();

  try {
    const { product_id, type, quantity, reason, note } = body;

    // Récupérer le produit actuel
    const { data: product, error: productError } = await (await supabase)
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('gym_id', gymId)
      .single();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    // Calculer le nouveau stock en pièces
    let newStockInPieces = product.stock_in_pieces;
    let newQuantity = product.quantity;

    if (type === 'in') {
      newStockInPieces += quantity;
    } else {
      newStockInPieces -= quantity;
    }

    // Calculer le nouveau nombre de paquets/unités
    if (product.package_type === 'single') {
      newQuantity = newStockInPieces;
    } else {
      const itemsPerPackage = product.items_per_package || 1;
      newQuantity = Math.floor(newStockInPieces / itemsPerPackage);
    }

    // Mettre à jour le produit
    const { error: updateError } = await (await supabase)
      .from('products')
      .update({
        quantity: newQuantity,
        stock_in_pieces: newStockInPieces,
        updated_at: new Date().toISOString()
      })
      .eq('id', product_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Créer le mouvement de stock
    const { data: movement, error: movementError } = await (await supabase)
      .from('stock_movements')
      .insert({
        product_id,
        gym_id: gymId,
        user_id: user.id,
        type,
        quantity,
        reason,
        note,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        users(full_name),
        products(name)
      `)
      .single();

    if (movementError) {
      return NextResponse.json({ error: movementError.message }, { status: 500 });
    }

    return NextResponse.json(movement);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
  const { searchParams } = new URL(request.url);
  const product_id = searchParams.get('product_id');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    let query = (await supabase)
      .from('stock_movements')
      .select(`
        *,
        users(full_name),
        products(name)
      `)
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (product_id) {
      query = query.eq('product_id', product_id);
    }

    const { data: movements, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(movements);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}