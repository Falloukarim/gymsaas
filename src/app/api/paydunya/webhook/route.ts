import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { parsePaydunyaPayload, verifyPaydunyaSignature } from '@/lib/paydunya/utils';

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const rawPayload = await request.text();

    const signature = request.headers.get('X-Paydunya-Signature');
    const isDev = process.env.NODE_ENV !== 'production' || process.env.DISABLE_SIGNATURE_CHECK === 'true';

    if (!isDev) {
      const isValid = verifyPaydunyaSignature(
        rawPayload,
        signature,
        process.env.PAYDUNYA_PRIVATE_KEY!
      );

      if (!isValid) {
        console.warn('❌ Signature invalide');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.warn('⚠️ Vérification de la signature désactivée');
    }

    // Parser le payload
    const payload = parsePaydunyaPayload(rawPayload);
    console.log('✅ Payload reçu :', JSON.stringify(payload, null, 2));

    // Champs requis
    const requiredData = {
      status: payload.data?.status,
      token: payload.data?.token || payload.data?.invoice?.token,
      gym_id: payload.data?.custom_data?.gym_id,
      subscription_id: payload.data?.custom_data?.subscription_id,
      billing_cycle: payload.data?.custom_data?.billing_cycle,
    };

    const missingFields = Object.entries(requiredData)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required data', missingFields },
        { status: 400 }
      );
    }

    const { status, receipt_url, payment_method, custom_data, token, invoice } = payload.data;
    
    // Récupérer le payment_id de manière robuste
    const paymentId = token || invoice?.token || custom_data?.payment_id || requiredData.token;
    
    if (!paymentId) {
      console.error('❌ Payment ID manquant dans le payload:', {
        token: payload.data?.token,
        invoice_token: payload.data?.invoice?.token,
        custom_data: payload.data?.custom_data
      });
      return NextResponse.json(
        { error: 'Missing payment ID/token' },
        { status: 400 }
      );
    }

    const startDate = new Date();
    const endDate = calculateEndDate(requiredData.billing_cycle);

    if (status === 'completed') {
      // Vérifier d'abord si le paiement existe déjà
      const { data: existingPayment, error: checkError } = await (await supabase)
        .from('gym_subscription_payments')
        .select('id')
        .eq('payment_id', paymentId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw checkError;
      }

      if (existingPayment) {
        // Mettre à jour le paiement existant
        const { error: paymentError } = await (await supabase)
          .from('gym_subscription_payments')
          .update({
            status: 'completed',
            receipt_url,
            payment_method,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('payment_id', paymentId);

        if (paymentError) throw paymentError;
      } else {
        // Créer un nouveau paiement
        const { error: paymentError } = await (await supabase)
          .from('gym_subscription_payments')
          .insert({
            payment_id: paymentId,
            gym_id: custom_data.gym_id,
            subscription_id: custom_data.subscription_id,
            amount: custom_data.amount || custom_data.total_amount,
            currency: 'XOF',
            status: 'completed',
            payment_method,
            receipt_url,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (paymentError) throw paymentError;
      }

      // Mettre à jour l'abonnement
      const { error: subscriptionError } = await (await supabase)
        .from('gym_subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', custom_data.subscription_id);

      if (subscriptionError) throw subscriptionError;

      // Mettre à jour le statut du gym
      const { error: gymError } = await (await supabase)
        .from('gyms')
        .update({
          subscription_active: true,
          current_subscription_id: custom_data.subscription_id,
          current_subscription_start: startDate.toISOString(),
          current_subscription_end: endDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', custom_data.gym_id);

      if (gymError) throw gymError;
    } else if (status === 'failed') {
      // Mettre à jour le statut en cas d'échec
      const { error: paymentError } = await (await supabase)
        .from('gym_subscription_payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', paymentId);

      if (paymentError) throw paymentError;
    }

    return NextResponse.json({
      success: true,
      paymentId,
      gymId: custom_data.gym_id,
      status,
      startDate,
      endDate
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Processing error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Calcul de la date de fin selon le cycle
function calculateEndDate(billingCycle: string): Date {
  const endDate = new Date();
  switch (billingCycle) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'semiannually':
      endDate.setMonth(endDate.getMonth() + 6);
      break;
    case 'annually':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      endDate.setMonth(endDate.getMonth() + 1);
  }
  return endDate;
}