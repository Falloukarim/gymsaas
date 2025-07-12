import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { qrCode } = await request.json();

  // 1. Vérifier le membre
  const { data: member, error } = await supabase
    .from('members')
    .select(`
      id,
      full_name,
      member_subscriptions(end_date)
    `)
    .eq('qr_code', qrCode)
    .single();

  if (error || !member) {
    return NextResponse.json(
      { valid: false, error: 'Membre non trouvé' },
      { status: 404 }
    );
  }

  // 2. Vérifier l'abonnement
  const hasActiveSubscription = member.member_subscriptions?.some(
    sub => new Date(sub.end_date) > new Date()
  );

  return NextResponse.json({
    valid: true,
    member: {
      id: member.id,
      name: member.full_name,
    },
    subscriptionStatus: hasActiveSubscription ? 'active' : 'expired'
  });
}