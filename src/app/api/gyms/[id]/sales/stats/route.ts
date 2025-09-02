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
    // Bénéfice total (depuis toutes les ventes)
    const { data: totalProfitData, error: totalProfitError } = await (await supabase)
      .from('sales')
      .select('total_profit')
      .eq('gym_id', gymId);

    if (totalProfitError) {
      console.error('Total profit error:', totalProfitError);
      return NextResponse.json({ error: totalProfitError.message }, { status: 500 });
    }

    const total_profit = totalProfitData?.reduce((sum, sale) => sum + (sale.total_profit || 0), 0) || 0;

    // Bénéfice du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: dailyProfitData, error: dailyProfitError } = await (await supabase)
      .from('sales')
      .select('total_profit')
      .eq('gym_id', gymId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    if (dailyProfitError) {
      console.error('Daily profit error:', dailyProfitError);
      return NextResponse.json({ error: dailyProfitError.message }, { status: 500 });
    }

    const daily_profit = dailyProfitData?.reduce((sum, sale) => sum + (sale.total_profit || 0), 0) || 0;

    // Bénéfices par produit (depuis les sale_items avec jointure correcte)
    const { data: saleItemsData, error: saleItemsError } = await (await supabase)
      .from('sale_items')
      .select(`
        product_id,
        quantity,
        unit_price,
        products!inner(name, cost_price),
        sales!inner(gym_id)
      `)
      .eq('sales.gym_id', gymId);

    if (saleItemsError) {
      console.error('Sale items error:', saleItemsError);
      return NextResponse.json({ error: saleItemsError.message }, { status: 500 });
    }

    const productProfitsMap = new Map();
    
    saleItemsData?.forEach(item => {
      const costPrice = item.products?.cost_price || 0;
      const profitPerUnit = item.unit_price - costPrice;
      const totalProfit = profitPerUnit * item.quantity;

      if (productProfitsMap.has(item.product_id)) {
        const existing = productProfitsMap.get(item.product_id);
        productProfitsMap.set(item.product_id, {
          profit: existing.profit + totalProfit,
          quantity_sold: existing.quantity_sold + item.quantity,
          product_name: item.products?.name || 'Produit inconnu'
        });
      } else {
        productProfitsMap.set(item.product_id, {
          profit: totalProfit,
          quantity_sold: item.quantity,
          product_name: item.products?.name || 'Produit inconnu'
        });
      }
    });

    const product_profits = Array.from(productProfitsMap.entries()).map(([product_id, data]) => ({
      product_id,
      product_name: data.product_name,
      profit: data.profit,
      quantity_sold: data.quantity_sold
    })).sort((a, b) => b.profit - a.profit);

    return NextResponse.json({
      daily_profit,
      total_profit,
      product_profits
    });
  } catch (error) {
    console.error('Internal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

