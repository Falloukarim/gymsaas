// pages/api/gym-subscriptions/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import paydunya from '@/lib/paydunya';
import { getSession } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession(req, res); // Notez le res ajouté
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { gym_id, name, description, price, billing_cycle } = req.body;

  try {
    // Vérifier que l'utilisateur a le droit de créer un abonnement pour ce gym
    const { data: gymUser, error: gymUserError } = await supabase
      .from('gbus')
      .select('role')
      .eq('gym_id', gym_id)
      .eq('user_id', session.user.id)
      .single();

    if (gymUserError || !gymUser || !['owner', 'admin'].includes(gymUser.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Créer le plan chez Paydunya
    const plan = await paydunya.createSubscriptionPlan({
      name,
      description,
      amount: price,
      interval: billing_cycle,
      currency: 'XOF'
    });

    // Enregistrer dans la base de données
    const { data: subscription, error } = await supabase
      .from('gym_subscriptions')
      .insert({
        gym_id,
        plan_id: plan.plan_id,
        name,
        description,
        price,
        billing_cycle,
        created_by: session.user.id
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(subscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}