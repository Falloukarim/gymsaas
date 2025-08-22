import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await (await supabase).auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    const { data: product, error } = await (await supabase)
      .from('products')
      .select('quantity, name, unit')
      .eq('id', productId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      hasEnoughStock: product.quantity >= quantity,
      currentStock: product.quantity,
      productName: product.name,
      unit: product.unit
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}