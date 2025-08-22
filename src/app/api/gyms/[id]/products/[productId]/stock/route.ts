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
      .select('quantity, name, unit')
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