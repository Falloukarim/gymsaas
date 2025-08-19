import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Authentification
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const supabase = createClient();
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  try {
    // Vérification connexion
    const { error: testError } = await (await (await supabase))
      .from('gyms')
      .select('id')
      .limit(1)
      .single();

    if (testError) throw testError;

    // Traitement des abonnements
    const gymsUpdate = await handleGymsSubscriptions(supabase, today, now);
    const membersUpdate = await handleMembersSubscriptions(supabase, today, now);

    return NextResponse.json({
      success: true,
      stats: { gyms: gymsUpdate, members: membersUpdate },
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

async function handleGymsSubscriptions(supabase: any, today: Date, now: Date) {
  const { data: gyms, error: fetchError } = await (await (await supabase))
    .from('gyms')
    .select(`
      id,
      current_subscription_id,
      subscription_active,
      current_subscription_end,
      trial_used,
      trial_end_date
    `)
    .or('trial_used.is.true,subscription_active.is.true');

  if (fetchError) throw fetchError;

  const expiredTrials = gyms?.filter((g: { trial_used: any; trial_end_date: string | number | Date; }) => 
    g.trial_used && g.trial_end_date && new Date(g.trial_end_date) <= today
  ) || [];

  const expiredPaid = gyms?.filter((g: { subscription_active: any; current_subscription_end: string | number | Date; }) => 
    g.subscription_active && g.current_subscription_end && new Date(g.current_subscription_end) <= today
  ) || [];

  // Mises à jour
  if (expiredTrials.length > 0) {
    const { error } = await (await (await supabase))
      .from('gyms')
      .update({ 
        subscription_active: false,
        updated_at: now.toISOString(),
        current_subscription_id: null,
        current_subscription_start: null,
        current_subscription_end: null
      })
      .in('id', expiredTrials.map((g: { id: any; }) => g.id));

    if (error) throw error;
  }

  if (expiredPaid.length > 0) {
    const { error } = await (await (await supabase))
      .from('gyms')
      .update({ 
        subscription_active: false,
        updated_at: now.toISOString(),
        current_subscription_id: null,
        current_subscription_start: null,
        current_subscription_end: null
      })
      .in('id', expiredPaid.map((g: { id: any; }) => g.id));

    if (error) throw error;
  }

  return { trials: expiredTrials.length, paid: expiredPaid.length };
}

async function handleMembersSubscriptions(supabase: any, today: Date, now: Date) {
  // Récupération des abonnements expirés
  const { data: expiredSubs, error: subsError } = await (await (await supabase))
    .from('member_subscriptions')
    .select('id, member_id')
    .lte('end_date', today.toISOString())
    .eq('status', 'active');

  if (subsError) throw subsError;

  let results = { subscriptions: 0, members: 0 };
  
  if (expiredSubs?.length > 0) {
    // Mise à jour des abonnements
    const { error: updateError } = await (await (await supabase))
      .from('member_subscriptions')
      .update({ 
        status: 'inactive',
        updated_at: now.toISOString()
      })
      .in('id', expiredSubs.map((sub: { id: any; }) => sub.id));

    if (updateError) throw updateError;

    // Mise à jour des membres
    const memberIds = expiredSubs.map((sub: { member_id: any; }) => sub.member_id);
    const { error: memberError } = await (await (await supabase))
      .from('members')
    .update({ 
      has_subscription: false,
      updated_at: now.toISOString()
    })
    .in('id', memberIds);

    if (memberError) throw memberError;

    results.subscriptions = expiredSubs.length;
    results.members = new Set(memberIds).size;
  }

  return results;
}