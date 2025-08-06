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
  const { sessionType } = await request.json();

  // Récupérer le prix de la session depuis la table subscriptions
  const { data: subscription } = await (await supabase)
    .from('subscriptions')
    .select('id, session_price')
    .eq('gym_id', gymId)
    .eq('type', 'session')
    .single();

  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  // Créer le ticket
  const { data: ticket, error } = await (await supabase)
    .from('tickets')
    .insert({
      gym_id: gymId,
      printed_by: user.id,
      price: subscription.session_price,
      session_type: sessionType,
      subscription_id: subscription.id
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(ticket);
}