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

    // Générer un ID de paiement unique AVANT d'appeler Paydunya
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('Création de la facture Paydunya avec:', {
      amount: subscription.price,
      paymentId,
      gym_id,
      subscription_id: subscription.id
    });

    // Création facture avec le payment_id dans les metadata
    const invoiceResponse = await paydunya.createInvoice(
      subscription.price,
      {
        email: user.email || '',
        name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || ''
      },
      {
        gym_id,
        subscription_id: subscription.id,
        billing_cycle: subscription.billing_cycle,
        payment_id: paymentId
      }
    );

    console.log('Réponse Paydunya:', invoiceResponse);

    // Vérifier que la réponse de Paydunya contient bien les données nécessaires
    if (!invoiceResponse) {
      throw new Error('Aucune réponse de Paydunya');
    }

    // La réponse Paydunya peut avoir différentes structures selon l'API
    const checkoutUrl = invoiceResponse.url || invoiceResponse.checkout_url;
    const paydunyaToken = invoiceResponse.token || invoiceResponse.invoice_token;

    if (!checkoutUrl) {
      console.error('Réponse Paydunya incomplète:', invoiceResponse);
      throw new Error('URL de checkout manquante dans la réponse Paydunya');
    }

    // Insertion sécurisée avec le paymentId généré
    const { error: paymentError } = await (await supabase)
      .from('gym_subscription_payments')
      .insert({
        gym_id,
        subscription_id: subscription.id,
        payment_id: paymentId,
        amount: subscription.price,
        currency: 'XOF',
        status: 'pending',
        start_date: new Date().toISOString(),
        end_date: calculateEndDate(subscription.billing_cycle)
      });

    if (paymentError) {
      console.error('Erreur insertion paiement:', paymentError);
      throw paymentError;
    }

    console.log('Paiement créé avec succès, paymentId:', paymentId);

    return NextResponse.json({ 
      checkout_url: checkoutUrl,
      payment_id: paymentId
    });

  } catch (error) {
    console.error('Checkout error détaillé:', error);
    
    let errorMessage = 'Erreur de paiement';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
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