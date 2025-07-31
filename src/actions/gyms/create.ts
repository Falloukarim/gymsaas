import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await (await supabase).auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const formData = await request.json();

  try {
    // 1. Créer d'abord la salle sans abonnement (subscription_active = false)
    const { data: salle, error: erreurSalle } = await (await supabase)
      .from('gyms')
      .insert({
        ...formData,
        owner_id: user.id,
        subscription_active: false, // Désactivé temporairement
        trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trial_used: false,
        current_subscription_id: null // Explicitement null
      })
      .select()
      .single();

    if (erreurSalle) throw erreurSalle;

    // 2. Créer l'abonnement d'essai avec le gym_id
    const { data: abonnementEssai, error: erreurEssai } = await (await supabase)
      .from('gym_subscriptions')
      .insert({
        gym_id: salle.id, // Ici on a maintenant le gym_id
        name: 'Essai gratuit',
        description: '30 jours gratuits',
        price: 0,
        currency: 'XOF',
        billing_cycle: 'monthly',
        is_trial: true,
        status: 'active',
        plan_id: `essai_${salle.id}`
      })
      .select()
      .single();

    if (erreurEssai) throw erreurEssai;

    // 3. Mettre à jour la salle avec l'abonnement
    const { error: erreurMiseAJour } = await (await supabase)
      .from('gyms')
      .update({
        subscription_active: true,
        current_subscription_id: abonnementEssai.id
      })
      .eq('id', salle.id);

    if (erreurMiseAJour) throw erreurMiseAJour;

    // 4. Ajouter les abonnements payants
    const { error: erreurAbonnements } = await (await supabase)
      .from('gym_subscriptions')
      .insert([
        {
          gym_id: salle.id,
          name: 'Mensuel',
          description: 'Accès illimité - 1 mois',
          price: 25000,
          currency: 'XOF',
          billing_cycle: 'monthly',
          is_trial: false,
          status: 'active',
          plan_id: `mensuel_${salle.id}`
        },
        {
          gym_id: salle.id,
          name: 'Annuel',
          description: 'Accès illimité - 1 an (-20%)',
          price: 200000,
          currency: 'XOF',
          billing_cycle: 'annually',
          is_trial: false,
          status: 'active',
          plan_id: `annuel_${salle.id}`
        }
      ]);

    if (erreurAbonnements) throw erreurAbonnements;

    // 5. Lier l'utilisateur comme propriétaire
    const { error: erreurProprio } = await (await supabase)
      .from('gbus')
      .insert({
        gym_id: salle.id,
        user_id: user.id,
        role: 'owner'
      });

    if (erreurProprio) throw erreurProprio;

    return NextResponse.json(salle, { status: 201 });

  } catch (error) {
    console.error('Erreur création salle:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur serveur',
        details: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    );
  }
}