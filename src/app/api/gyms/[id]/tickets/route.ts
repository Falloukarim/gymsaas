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

  try {
    // Récupérer le prix de la session
    const { data: subscription, error: subscriptionError } = await (await supabase)
      .from('subscriptions')
      .select('id, session_price')
      .eq('gym_id', gymId)
      .eq('type', 'session')
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: subscriptionError?.message || 'Subscription not found' }, 
        { status: 404 }
      );
    }

    // Créer le ticket avec la date actuelle
    const { data: ticket, error: ticketError } = await (await supabase)
      .from('tickets')
      .insert({
        gym_id: gymId,
        printed_by: user.id,
        price: subscription.session_price,
        session_type: sessionType,
        subscription_id: subscription.id,
        printed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (ticketError) {
      return NextResponse.json({ error: ticketError.message }, { status: 500 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}