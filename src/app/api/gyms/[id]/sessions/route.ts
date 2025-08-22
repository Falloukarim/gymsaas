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
    // Récupérer toutes les sessions disponibles pour ce gym
    const { data: sessions, error } = await (await supabase)
      .from('subscriptions')
      .select('id, session_price, description, type')
      .eq('gym_id', gymId)
      .eq('is_session', true)
      .order('session_price');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}