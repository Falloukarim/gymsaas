// src/app/api/subscriptions/create/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface SubscriptionData {
  gym_id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'quarterly' | 'semiannually' | 'annually';
  is_trial?: boolean;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await (await supabase).auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: SubscriptionData = await request.json();
    const { gym_id, name, description, price, billing_cycle, is_trial } = body;

    // Validation
    if (!gym_id || !name || !price || !billing_cycle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Vérification des permissions
    const { data: gymUser, error: gymUserError } = await (await supabase)
      .from('gbus')
      .select('role')
      .eq('gym_id', gym_id)
      .eq('user_id', user.id)
      .single();

    if (gymUserError || !gymUser || !['owner', 'admin'].includes(gymUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Création dans la base de données
    const { data: subscription, error: dbError } = await (await supabase)
      .from('gym_subscriptions')
      .insert({
        gym_id,
        name,
        description,
        price,
        billing_cycle,
        is_trial: is_trial || false,
        plan_id: `local_${crypto.randomUUID()}` // ID local uniquement
      })
      .select()
      .single();

    if (dbError || !subscription) {
      throw dbError || new Error('Failed to create subscription');
    }

    return NextResponse.json(subscription, { status: 201 });

  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}