import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Interfaces pour le typage
interface Gym {
  id: string;
  name: string;
  email?: string;
  current_subscription_id?: string;
  subscription_active: boolean;
  current_subscription_end?: string;
  trial_used: boolean;
  trial_end_date?: string;
}

interface MemberSubscription {
  id: string;
  member_id: string;
  end_date: string;
  members?: {
    full_name: string;
    email?: string;
    gym_id: string;
    gyms?: {
      name: string;
    };
  };
}

interface UpdateResult {
  updated: number;
  error: string | null;
}

interface GymResult {
  trials: number;
  paid: number;
  updated: number;
  total_processed: number;
}

interface MemberResult {
  subscriptions: number;
  members: number;
  subscriptions_updated: number;
  members_updated: number;
}

export async function GET(request: Request) {
  // Authentification stricte en production
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    console.error('🚨 Tentative d\'accès non autorisée au cron');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const supabase = createClient();
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Log de début
  console.log('=== DÉBUT CRON ABONNEMENTS ===', {
    timestamp: now.toISOString(),
    environment: process.env.NODE_ENV
  });

  try {
    // Vérification connexion
    const { error: testError } = await (await supabase)
      .from('gyms')
      .select('id')
      .limit(1)
      .single();

    if (testError) {
      console.error('❌ Erreur connexion Supabase:', testError);
      throw new Error(`Connexion Base de données: ${testError.message}`);
    }

    // Traitement des abonnements
    const gymsResult = await handleGymsSubscriptions(supabase, today, now);
    const membersResult = await handleMembersSubscriptions(supabase, today, now);

    // Log de succès
    console.log('✅ Cron exécuté avec succès:', {
      gyms: gymsResult,
      members: membersResult,
      durée: `${Date.now() - now.getTime()}ms`
    });

    return NextResponse.json({
      success: true,
      stats: { 
        gyms: gymsResult, 
        members: membersResult 
      },
      timestamp: now.toISOString(),
      environment: process.env.NODE_ENV
    });

  } catch (error: unknown) {
    // Log d'erreur détaillé
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ Erreur critique du cron:', {
      error: errorMessage,
      stack: errorStack,
      timestamp: now.toISOString()
    });

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        timestamp: now.toISOString()
      },
      { status: 500 }
    );
  }
}

async function handleGymsSubscriptions(supabase: any, today: Date, now: Date): Promise<GymResult> {
  try {
    const { data: gyms, error: fetchError } = await supabase
      .from('gyms')
      .select(`
        id,
        name,
        email,
        current_subscription_id,
        subscription_active,
        current_subscription_end,
        trial_used,
        trial_end_date
      `)
      .or('trial_used.is.true,subscription_active.is.true');

    if (fetchError) throw fetchError;

    const expiredTrials = (gyms || []).filter((g: Gym) => 
      g.trial_used && g.trial_end_date && new Date(g.trial_end_date) <= today
    );

    const expiredPaid = (gyms || []).filter((g: Gym) => 
      g.subscription_active && g.current_subscription_end && new Date(g.current_subscription_end) <= today
    );

    const expiredGyms = [...expiredTrials, ...expiredPaid];
    
    let updatedCount = 0;
    
    if (expiredGyms.length > 0) {
      console.log(`🔄 Désactivation de ${expiredGyms.length} gyms expirés`);
      
      const { error, count } = await supabase
        .from('gyms')
        .update({ 
          subscription_active: false,
          updated_at: now.toISOString()
        })
        .in('id', expiredGyms.map((g: Gym) => g.id))
        .select('id', { count: 'exact' });

      if (error) throw error;
      
      updatedCount = count || expiredGyms.length;

      // Log des gyms désactivés
      expiredGyms.forEach((gym: Gym) => {
        console.log(`📝 Gym désactivé: ${gym.name} (${gym.id}) - ${gym.email}`);
      });
    }

    return { 
      trials: expiredTrials.length, 
      paid: expiredPaid.length,
      updated: updatedCount,
      total_processed: gyms?.length || 0
    };

  } catch (error) {
    console.error('❌ Erreur gestion gyms:', error);
    throw error;
  }
}

async function handleMembersSubscriptions(supabase: any, today: Date, now: Date): Promise<MemberResult> {
  try {
    // Récupération des abonnements expirés
    const { data: expiredSubs, error: subsError } = await supabase
      .from('member_subscriptions')
      .select(`
        id, 
        member_id,
        end_date,
        members(full_name, email, gym_id, gyms(name))
      `)
      .lte('end_date', today.toISOString())
      .eq('status', 'active');

    if (subsError) throw subsError;

    const results: MemberResult = { 
      subscriptions: 0, 
      members: 0, 
      subscriptions_updated: 0,
      members_updated: 0 
    };
    
    if (expiredSubs && expiredSubs.length > 0) {
      console.log(`🔄 Traitement de ${expiredSubs.length} abonnements membres expirés`);

      const subscriptionIds = expiredSubs.map((sub: MemberSubscription) => sub.id);
      const memberIds = [...new Set(expiredSubs.map((sub: MemberSubscription) => sub.member_id))];

      // Mise à jour des abonnements - avec gestion des erreurs
      const { error: updateError, count: subsCount } = await supabase
        .from('member_subscriptions')
        .update({ 
          status: 'inactive',
          updated_at: now.toISOString()
        })
        .in('id', subscriptionIds)
        .select('id', { count: 'exact' });

      if (updateError) throw updateError;
      results.subscriptions_updated = subsCount || subscriptionIds.length;

      // Mise à jour des membres - avec gestion des erreurs
      const { error: memberError, count: membersCount } = await supabase
        .from('members')
        .update({ 
          has_subscription: false,
          updated_at: now.toISOString()
        })
        .in('id', memberIds)
        .select('id', { count: 'exact' });

      if (memberError) throw memberError;
      results.members_updated = membersCount || memberIds.length;

      results.subscriptions = expiredSubs.length;
      results.members = memberIds.length;

      // Log des membres désactivés
      expiredSubs.forEach((sub: MemberSubscription) => {
        console.log(`📝 Abonnement désactivé: ${sub.members?.full_name} (${sub.member_id}) - Gym: ${sub.members?.gyms?.name}`);
      });
    } else {
      console.log('ℹ️ Aucun abonnement membre à désactiver');
    }

    return results;

  } catch (error) {
    console.error('❌ Erreur gestion membres:', error);
    throw error;
  }
}