import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gymId = searchParams.get('gym_id');

  if (!gymId) {
    return NextResponse.json(
      { error: 'Paramètre gym_id requis' },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from('subscriptions')
    .select('*')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const body = await request.json();

  if (!body.gym_id || !body.name || !body.price || !body.duration_days) {
    return NextResponse.json(
      { error: 'Champs obligatoires manquants' },
      { status: 400 }
    );
  }

  const { error } = await (await supabase)
    .from('subscriptions')
    .insert({
      gym_id: body.gym_id,
      name: body.name,
      price: body.price,
      duration_days: body.duration_days,
      description: body.description || null
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true },
    { status: 201 }
  );
}