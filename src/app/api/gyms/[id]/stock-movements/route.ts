import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

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
  const productId = searchParams.get('product_id');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    let query = (await supabase)
      .from('stock_movements')
      .select(`
        *,
        products(name),
        users(full_name)
      `)
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productId) {
      query = query.eq('product_id', productId);
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
    // Pour les sorties de stock, vérifier d'abord le stock disponible
    if (body.type === 'out') {
      const { data: product, error: productError } = await (await supabase)
        .from('products')
        .select('quantity, name')
        .eq('id', body.product_id)
        .single();

      if (productError) {
        return NextResponse.json({ error: productError.message }, { status: 500 });
      }

      if (product.quantity < body.quantity) {
        return NextResponse.json({ 
          error: `Stock insuffisant pour ${product.name}. Stock disponible: ${product.quantity}` 
        }, { status: 400 });
      }
    }

    // Mettre à jour la quantité du produit
    const { data: product, error: getError } = await (await supabase)
  .from('products')
  .select('quantity')
  .eq('id', body.product_id)
  .single();
  if (getError) {
  return NextResponse.json({ error: getError.message }, { status: 500 });
}

const newQuantity = body.type === 'in'
  ? product.quantity + body.quantity
  : product.quantity - body.quantity;

  const { error: updateError } = await (await supabase)
  .from('products')
  .update({ 
    quantity: newQuantity,
    updated_at: new Date().toISOString()
  })
  .eq('id', body.product_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Créer le mouvement de stock
    const { error: movementError } = await (await supabase)
      .from('stock_movements')
      .insert({
        product_id: body.product_id,
        gym_id: gymId,
        user_id: user.id,
        type: body.type,
        quantity: body.quantity,
        reason: body.reason,
        note: body.note
      });

    if (movementError) {
      return NextResponse.json({ error: movementError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}