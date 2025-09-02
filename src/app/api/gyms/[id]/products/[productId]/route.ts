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
    // Calculer les prix unitaires si nécessaire
    let unit_price = parseFloat(body.price) || 0;
    let unit_cost_price = body.cost_price ? parseFloat(body.cost_price) : null;

    if (body.package_type !== 'single') {
      const itemsPerPackage = parseInt(body.items_per_package) || 1;
      const packagePrice = parseFloat(body.package_price) || 0;
      const packageCostPrice = body.package_cost_price ? parseFloat(body.package_cost_price) : null;
      
      unit_price = itemsPerPackage > 0 ? (packagePrice / itemsPerPackage) : 0;
      unit_cost_price = itemsPerPackage > 0 && packageCostPrice ? (packageCostPrice / itemsPerPackage) : null;
    }

    // Calculer le stock en pièces
    const quantity = parseInt(body.quantity) || 0;
    const itemsPerPackage = parseInt(body.items_per_package) || 1;
    const stock_in_pieces = body.package_type === 'single' 
      ? quantity 
      : quantity * itemsPerPackage;

    // Mettre à jour le produit
    const { data: product, error } = await (await supabase)
      .from('products')
      .update({
        name: body.name,
        category_id: body.category_id,
        description: body.description,
        price: parseFloat(body.price),
        cost_price: body.cost_price ? parseFloat(body.cost_price) : null,
        quantity: quantity,
        stock_in_pieces: stock_in_pieces,
        unit: body.unit,
        supplier_id: body.supplier_id || null,
        min_stock_level: 10, // Seuil fixe à 10 pièces
        is_active: body.is_active !== undefined ? body.is_active : true,
        package_type: body.package_type || 'single',
        items_per_package: itemsPerPackage,
        package_price: body.package_price ? parseFloat(body.package_price) : null,
        package_cost_price: body.package_cost_price ? parseFloat(body.package_cost_price) : null,
        unit_price: unit_price,
        unit_cost_price: unit_cost_price,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .eq('gym_id', gymId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Internal error:', error);
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