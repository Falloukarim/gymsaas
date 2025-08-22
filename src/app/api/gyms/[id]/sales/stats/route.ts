// src/app/api/gyms/[id]/sales/stats/route.ts
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

  try {
    // Ventes d'aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todaySales, error: salesError } = await (await supabase)
      .from('sales')
      .select('total_amount')
      .eq('gym_id', gymId)
      .gte('created_at', today.toISOString());

    if (salesError) {
      return NextResponse.json({ error: salesError.message }, { status: 500 });
    }

    const today_revenue = todaySales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
    const today_sales = todaySales?.length || 0;

    // Produit le plus vendu aujourd'hui
    const { data: bestSelling, error: bestSellingError } = await (await supabase)
      .from('sale_items')
      .select('products(name), quantity')
      .eq('sales.gym_id', gymId)
      .gte('sales.created_at', today.toISOString())
      .order('quantity', { ascending: false })
      .limit(1)
      .single();

    const best_selling_product = bestSelling?.products?.name || 'Aucun';

    // Produits en stock faible
    const { data: lowStockProducts, error: lowStockError } = await (await supabase)
      .from('products')
      .select('id')
      .eq('gym_id', gymId)
      .lte('quantity', 'min_stock_level')
      .gt('quantity', 0);

    const low_stock_count = lowStockProducts?.length || 0;

    return NextResponse.json({
      today_sales,
      today_revenue,
      best_selling_product,
      low_stock_count
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}