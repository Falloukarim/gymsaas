import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const formData = await req.formData();

  const full_name = formData.get('full_name') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string | null;
  const subscription_id = formData.get('subscription_id') as string;
  const gym_id = formData.get('gym_id') as string;

  const supabase = createClient();

  // Récupérer la durée de l'abonnement sélectionné
  const { data: subscription } = await (await supabase)
    .from('subscriptions')
    .select('duration_days')
    .eq('id', subscription_id)
    .single();

  if (!subscription) {
    return NextResponse.json({ error: 'Abonnement invalide' }, { status: 400 });
  }

  // Créer le membre
  const { data: member, error: memberError } = await (await supabase)
    .from('members')
    .insert({
      gym_id,
      full_name,
      phone,
      email,
      role: 'staff' // ou autre valeur selon ta logique
    })
    .select()
    .single();

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 400 });
  }

  // Calculer la date de fin
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + subscription.duration_days);

  // Créer member_subscription
  const { error: msError } = await (await supabase)
    .from('member_subscriptions')
    .insert({
      member_id: member.id,
      subscription_id,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });

  if (msError) {
    return NextResponse.json({ error: msError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
