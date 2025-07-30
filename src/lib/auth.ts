import { createClient } from '@/utils/supabase/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/utils/types/supabase';

// Pour App Router (Server Components, Server Actions)
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await (await supabase).auth.getUser();
  
  if (error || !user) {
    console.error('Error getting current user:', error);
    return null;
  }
  
  return user;
}

export async function getGymIdForCurrentUser(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from('gbus')
    .select('gym_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    console.error('Error getting gym for user:', error);
    return null;
  }

  return data.gym_id;
}

// Pour Pages Router (API Routes)
export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient<Database>({ req, res });
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return session;
}

export async function getUserGymId(userId: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from('gbus')
    .select('gym_id')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Error getting gym ID:', error);
    throw new Error('Gym not found');
  }

  return data.gym_id;
}

export async function checkSubscriptionActive(gymId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from('gyms')
    .select('subscription_active, trial_end_date')
    .eq('id', gymId)
    .single();

  if (error) {
    console.error('Error checking subscription:', error);
    throw error;
  }

  // Vérifier si en période d'essai
  if (data.trial_end_date && new Date(data.trial_end_date) > new Date()) {
    return true;
  }

  return data.subscription_active ?? false;
}

// Helper pour vérifier les rôles
export async function checkUserRole(
  userId: string,
  gymId: string,
  requiredRoles: string[]
): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from('gbus')
    .select('role')
    .eq('user_id', userId)
    .eq('gym_id', gymId)
    .single();

  if (error || !data) {
    console.error('Error checking user role:', error);
    return false;
  }

  return requiredRoles.includes(data.role);
}

export async function getApiRouteSession(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient<Database>({ req, res });
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return session;
}

// Fonction générique de gestion d'erreurs
export function handleError(error: unknown): { message: string } {
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'An unknown error occurred' };
}

// Version typée de la gestion d'erreurs Paydunya
interface PaydunyaError extends Error {
  response?: {
    data?: any;
  };
}

export function handlePaydunyaError(error: unknown): never {
  const err = error as PaydunyaError;
  console.error('Paydunya error:', err.response?.data || err.message);
  throw new Error(err.response?.data?.message || err.message || 'Paydunya operation failed');
}