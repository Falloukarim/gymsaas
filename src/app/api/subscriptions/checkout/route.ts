import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import paydunya from '@/lib/paydunya';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await (await supabase).auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { subscription_id, gym_id } = await request.json();
    
    // Validation des entrées
    if (!subscription_id || !gym_id) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Récupération abonnement
    const { data: subscription, error: subError } = await (await supabase)
      .from('gym_subscriptions')
      .select('*')
      .eq('id', subscription_id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Abonnement introuvable' },
        { status: 404 }
      );
    }

    // Création facture
    const { url: checkout_url, token: payment_id } = await paydunya.createInvoice(
      subscription.price,
      {
        email: user.email,
        name: user.user_metadata.full_name || '',
        phone: user.user_metadata.phone || ''
      },
      {
        gym_id,
        subscription_id: subscription.id,
        billing_cycle: subscription.billing_cycle
      }
    );

    // Insertion sécurisée
    const { error: paymentError } = await (await supabase)
      .from('gym_subscription_payments')
      .insert({
        gym_id,
        subscription_id: subscription.id,
        payment_id, // Garanti non-null
        amount: subscription.price,
        currency: 'XOF',
        status: 'pending',
        start_date: new Date().toISOString(),
        end_date: calculateEndDate(subscription.billing_cycle)
      });

    if (paymentError) throw paymentError;

    return NextResponse.json({ checkout_url });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur de paiement' },
      { status: 500 }
    );
  }
}

function calculateEndDate(billingCycle: string): string {
  const date = new Date();
  switch (billingCycle) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'semiannually':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString();
}