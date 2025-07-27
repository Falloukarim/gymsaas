import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient();

  const { data: { user } } = await (await supabase).auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Récupérer le gymId depuis l'URL
  const url = new URL(request.url);
  const gymId = url.searchParams.get('gymId');

  if (!gymId) {
    return NextResponse.json({ error: 'Missing gymId' }, { status: 400 });
  }

  // Vérifier si l'utilisateur a accès à ce gym
  const { data: gbus } = await (await supabase)
    .from('gbus')
    .select('role')
    .eq('gym_id', gymId)
    .eq('user_id', user.id)
    .single();

  if (!gbus) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Récupérer tous les utilisateurs du gym
  const { data: users } = await (await supabase)
    .from('gbus')
    .select('*, users(*)')
    .eq('gym_id', gymId);

  return NextResponse.json(users);
}