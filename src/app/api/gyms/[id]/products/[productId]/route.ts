import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';


  export async function GET(
  request: Request,
  { params }: { params: { id: string; productId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gymId = params.id;
  const productId = params.productId;

  try {
    const { data: product, error } = await (await supabase)
      .from('products')
      .select(`
        *,
        product_categories(name),
        suppliers(name)
      `)
      .eq('id', productId)
      .eq('gym_id', gymId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; productId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gymId = params.id;
  const productId = params.productId;
  const body = await request.json();

  try {
    // Récupérer l'ancienne quantité pour calculer la différence
    const { data: oldProduct, error: fetchError } = await (await supabase)
      .from('products')
      .select('quantity')
      .eq('id', productId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const oldQuantity = oldProduct.quantity;
    const newQuantity = parseInt(body.quantity);
    const quantityDifference = newQuantity - oldQuantity;

    // Mettre à jour le produit
    const { data: product, error } = await (await supabase)
      .from('products')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .eq('gym_id', gymId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Si la quantité a changé, créer un mouvement de stock
    if (quantityDifference !== 0) {
      const stockType = quantityDifference > 0 ? 'in' : 'out';
      const absoluteDifference = Math.abs(quantityDifference);
      
      // Mettre à jour le mouvement de stock
      const { error: movementError } = await (await supabase)
        .from('stock_movements')
        .insert({
          product_id: productId,
          gym_id: gymId,
          user_id: user.id,
          type: stockType,
          quantity: absoluteDifference,
          reason: 'Ajustement manuel',
          note: `Quantité ajustée de ${oldQuantity} à ${newQuantity}`
        });

      if (movementError) {
        console.error('Error creating stock movement:', movementError);
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; productId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gymId = params.id;
  const productId = params.productId;

  try {
    const { error } = await (await supabase)
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('gym_id', gymId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}