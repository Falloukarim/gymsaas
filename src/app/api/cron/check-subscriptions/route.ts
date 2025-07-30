import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic'; // Nécessaire pour les Serverless Functions

export async function GET(request: Request) {
  // === 1. Vérification stricte de l'authentification ===
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    console.error('❌ Accès refusé : Token manquant ou invalide');
    return NextResponse.json(
      { 
        error: 'Unauthorized',
        message: 'Authentification requise',
        timestamp: new Date().toISOString() 
      },
      { status: 401 }
    );
  }

  // === 2. Initialisation ===
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  console.log(`⚡ Cron exécuté à ${now} (Production)`);

  try {
    // === 3. Récupération des abonnements expirés ===
    console.log('🔍 Recherche des abonnements expirés...');
    const { data: gyms, error: fetchError } = await (await supabase)
      .from('gyms')
      .select(`
        id,
        current_subscription_id,
        subscription_active,
        current_subscription_end,
        trial_used,
        trial_end_date
      `)
      .or(`and(trial_used.eq.true,lte(trial_end_date,${today})),and(subscription_active.eq.true,lte(current_subscription_end,${today}))`);

    if (fetchError) {
      throw new Error(`Erreur Supabase: ${fetchError.message}`);
    }

    // === 4. Traitement des expirations ===
    const expiredTrials = gyms?.filter(g => g.trial_used && g.trial_end_date <= today) || [];
    const expiredPaid = gyms?.filter(g => g.subscription_active && g.current_subscription_end <= today) || [];

    // Désactivation des essais expirés
    if (expiredTrials.length > 0) {
      const { error: trialError } = await (await supabase)
        .from('gyms')
        .update({ 
          subscription_active: false,
          updated_at: now
        })
        .in('id', expiredTrials.map(g => g.id));

      if (trialError) throw trialError;
      console.log(`🛑 ${expiredTrials.length} essais désactivés`);
    }

    // Désactivation des abonnements payants expirés
    if (expiredPaid.length > 0) {
      const { error: paidError } = await (await supabase)
        .from('gyms')
        .update({ 
          subscription_active: false,
          current_subscription_id: null,
          updated_at: now
        })
        .in('id', expiredPaid.map(g => g.id));

      if (paidError) throw paidError;
      console.log(`💳 ${expiredPaid.length} abonnements payants désactivés`);
    }

    // === 5. Réponse de succès ===
    return NextResponse.json({
      success: true,
      stats: {
        trials_disabled: expiredTrials.length,
        paid_subscriptions_disabled: expiredPaid.length,
      },
      timestamp: now
    });

  } catch (error) {
    console.error('🔥 Erreur critique:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: now 
      },
      { status: 500 }
    );
  }
}