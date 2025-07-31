import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // === 1. Authentification ===
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    console.error('❌ Accès refusé - Token:', {
      received: authHeader?.slice(0, 10) + '...',
      expected: expectedToken.slice(0, 10) + '...'
    });
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentification requise' },
      { status: 401 }
    );
  }

  // === 2. Initialisation ===
  const supabase = createClient();
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0); // Normalisation à minuit UTC

  console.log(`⚡ Cron démarré à ${now.toISOString()}`);

  try {
    // === 3. Vérification connexion ===
    const { error: testError } = await (await supabase)
      .from('gyms')
      .select('id')
      .limit(1)
      .single();

    if (testError) throw new Error(`Supabase: ${testError.message}`);

    // === 4. Récupération des données ===
    console.log('🔍 Recherche des abonnements expirés...');
    
    const { data: gyms, error: fetchError } = await (await supabase)
      .from('gyms')
      .select(`
        id,
        current_subscription_id,
        subscription_active,
        current_subscription_end,
        trial_used,
        trial_end_date,
        owner_id
      `)
      .or(`trial_used.is.true,subscription_active.is.true`);

    if (fetchError) throw new Error(`Fetch: ${fetchError.message}`);

    // === 5. Filtrage côté serveur ===
    const expiredTrials = gyms?.filter(g => 
      g.trial_used && g.trial_end_date && new Date(g.trial_end_date) <= today
    ) || [];

    const expiredPaid = gyms?.filter(g => 
      g.subscription_active && 
      g.current_subscription_end && 
      new Date(g.current_subscription_end) <= today
    ) || [];

    console.log('📊 Résultats:', {
      total: gyms?.length,
      trials: expiredTrials.length,
      paid: expiredPaid.length
    });

    // === 6. Mises à jour avec gestion des contraintes ===
    const updatePromises = [];
    
    if (expiredTrials.length > 0) {
      updatePromises.push(
        (await supabase).from('gyms')
          .update({ 
            subscription_active: false,
            updated_at: now.toISOString(),
            // Reset les champs d'abonnement si nécessaire
            current_subscription_id: null,
            current_subscription_start: null,
            current_subscription_end: null
          })
          .in('id', expiredTrials.map(g => g.id))
      );
    }

    if (expiredPaid.length > 0) {
      updatePromises.push(
        (await supabase).from('gyms')
          .update({ 
            subscription_active: false,
            current_subscription_id: null,
            current_subscription_start: null,
            current_subscription_end: null,
            updated_at: now.toISOString()
          })
          .in('id', expiredPaid.map(g => g.id))
      );
    }

    // === 7. Exécution des mises à jour ===
    if (updatePromises.length > 0) {
      const results = await Promise.all(updatePromises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        // Log détaillé des erreurs
        console.error('Erreurs de mise à jour:', errors);
        throw new Error(`Échec des mises à jour: ${errors.map(e => 
          `Gym ${e.data?.map(d => d.id)}: ${e.error?.message}`
        ).join(' | ')}`);
      }
      
      console.log(`✅ Mises à jour réussies: ${expiredTrials.length} essais + ${expiredPaid.length} abonnements`);
    }

    // === 8. Réponse ===
    return NextResponse.json({
      success: true,
      stats: {
        trials_disabled: expiredTrials.length,
        paid_subscriptions_disabled: expiredPaid.length
      },
      timestamp: now.toISOString()
    });

  } catch (error) {
    const err = error instanceof Error ? error : new Error('Erreur inconnue');
    console.error('🔥 Erreur:', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur de traitement',
        details: process.env.NODE_ENV === 'development' ? {
          message: err.message,
          stack: err.stack
        } : undefined,
        timestamp: now.toISOString() 
      },
      { status: 500 }
    );
  }
}